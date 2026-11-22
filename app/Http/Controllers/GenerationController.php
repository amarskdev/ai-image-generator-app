<?php

namespace App\Http\Controllers;

use App\Models\Generation;
use App\Models\User;
use App\Services\CreditAccountService;
use App\Services\GenerationCostCalculator;
use App\Services\GenerationReconciler;
use App\Services\GenerationStateUpdater;
use App\Services\InsufficientCreditBalanceException;
use App\Services\PixelforgeApiException;
use App\Services\PixelforgeClient;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GenerationController extends Controller
{
    public function __construct(
        private readonly PixelforgeClient $pixelforge,
        private readonly GenerationCostCalculator $costCalculator,
        private readonly GenerationStateUpdater $stateUpdater,
        private readonly GenerationReconciler $reconciler,
        private readonly CreditAccountService $creditAccount,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->reconciler->reconcileFor($user);
        $pricing = $this->pixelforge->pricing();

        return Inertia::render('Dashboard', [
            'pricing' => $pricing,
            'requestId' => (string) Str::uuid(),
            'credits' => [
                'balance' => $this->costCalculator->formatNanos($user->fresh()->credit_balance_nanos),
                'purchaseOptions' => ['5', '10', '25'],
            ],
            'generations' => $user->generations()->latest()->limit(3)->get()->map(
                fn (Generation $generation): array => $this->present($generation),
            )->values(),
        ]);
    }

    public function history(Request $request): Response
    {
        $user = $request->user();
        $this->reconciler->reconcileFor($user);

        return Inertia::render('Generations/Index', [
            'generations' => $user->generations()->latest()->limit(30)->get()->map(
                fn (Generation $generation): array => $this->present($generation),
            )->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'request_id' => ['required', 'uuid'],
            'prompt' => ['required', 'string', 'max:4000'],
            'size' => ['required', Rule::in(['1024x1024', '1536x1024', '1024x1536'])],
            'quality' => ['required', Rule::in(['low', 'medium', 'high'])],
            'reference_images' => ['nullable', 'array', 'max:4'],
            'reference_images.*' => ['required', 'url:http,https', 'max:2048'],
        ]);

        $referenceImages = array_values($validated['reference_images'] ?? []);
        $user = $request->user();
        $existing = $user->generations()
            ->where('client_request_id', $validated['request_id'])
            ->first();

        if ($existing !== null) {
            return $this->handleDuplicateSubmission($existing, $validated, $referenceImages);
        }

        $pricing = $this->pixelforge->pricing();
        $estimate = $this->costCalculator->estimate(
            $validated['prompt'],
            count($referenceImages),
            $validated['quality'],
            $validated['size'],
            $pricing['rates'],
            $pricing['tokens'],
        );
        $maximumCharge = $this->costCalculator->maximumCharge(
            $validated['prompt'],
            count($referenceImages),
            $validated['quality'],
            $validated['size'],
            $pricing['rates'],
            $pricing['tokens'],
        );

        try {
            $generation = DB::transaction(function () use ($user, $validated, $referenceImages, $pricing, $estimate, $maximumCharge): Generation {
                $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
                $generation = $lockedUser->generations()->create([
                    'id' => (string) Str::uuid(),
                    'client_request_id' => $validated['request_id'],
                    'idempotency_key' => (string) Str::uuid(),
                    'prompt' => $validated['prompt'],
                    'size' => $validated['size'],
                    'quality' => $validated['quality'],
                    'reference_images' => $referenceImages,
                    'status' => 'queued',
                    'provider_rates' => $pricing['rates'],
                    'estimated_provider_cost_nanos' => $estimate['provider'],
                    'estimated_customer_charge_nanos' => $estimate['customer'],
                    'maximum_customer_charge_nanos' => $maximumCharge['customer'],
                    'submitted_at' => now(),
                ]);

                if (! $this->creditAccount->reserveForNewGeneration(
                    $lockedUser,
                    $generation,
                    $maximumCharge['customer'],
                    (string) Str::uuid(),
                )) {
                    throw new InsufficientCreditBalanceException;
                }

                return $generation;
            });
        } catch (InsufficientCreditBalanceException) {
            return back()->with('error', 'Your balance cannot cover the maximum possible charge. Buy credits and try again.');
        } catch (UniqueConstraintViolationException $exception) {
            $existing = $user->generations()
                ->where('client_request_id', $validated['request_id'])
                ->first();

            if ($existing === null) {
                throw $exception;
            }

            return $this->handleDuplicateSubmission($existing, $validated, $referenceImages);
        }

        return $this->submit($generation);
    }

    public function retry(Request $request, string $generation): RedirectResponse
    {
        $record = $request->user()->generations()->whereKey($generation)->firstOrFail();

        if ($record->provider_generation_id !== null ||
            ($record->status !== 'queued' && ! in_array($record->provider_error_code, [
                'rate_limit_exceeded',
                'concurrency_limit_exceeded',
                'daily_limit_exceeded',
                'overloaded',
            ], true))) {
            abort(409, 'This generation cannot be retried.');
        }

        if ($record->retry_after_at !== null && $record->retry_after_at->isFuture()) {
            return back()->with('warning', 'Please wait before retrying this generation.');
        }

        if ($record->maximum_customer_charge_nanos === null) {
            $pricing = $this->pixelforge->pricing();
            $maximumCharge = $this->costCalculator->maximumCharge(
                $record->prompt,
                count($record->reference_images ?? []),
                $record->quality,
                $record->size,
                $record->provider_rates ?? $pricing['rates'],
                $pricing['tokens'],
            );
            $record->forceFill(['maximum_customer_charge_nanos' => $maximumCharge['customer']])->save();
        }

        if (! $this->creditAccount->reserveGeneration(
            $record,
            $record->maximum_customer_charge_nanos,
        )) {
            return back()->with('error', 'Your balance cannot cover the maximum possible charge. Buy credits and try again.');
        }

        $record->forceFill([
            'status' => 'queued',
            'provider_error_code' => null,
            'provider_error_message' => null,
            'retry_after_at' => null,
        ])->save();

        return $this->submit($record);
    }

    private function submit(Generation $generation): RedirectResponse
    {
        try {
            $providerGeneration = $this->pixelforge->createGeneration([
                'prompt' => $generation->prompt,
                'size' => $generation->size,
                'quality' => $generation->quality,
                'reference_images' => $generation->reference_images,
                'metadata' => [
                    'application_generation_id' => $generation->id,
                ],
            ], $generation->idempotency_key);

            $this->stateUpdater->apply($generation, $providerGeneration);

            return redirect()->route('generations.index')->with('success', 'Your generation has been submitted.');
        } catch (PixelforgeApiException $exception) {
            $retryAfterAt = null;
            $retryMessage = '';

            if ($exception->providerCode === 'daily_limit_exceeded') {
                $retryAfterAt = now('UTC')->addDay()->startOfDay();
                $retryMessage = ' Try again after the daily quota resets.';
            } else {
                $retryAfter = $exception->retryAfter;

                if ($retryAfter === null && $exception->status === 503) {
                    $retryAfter = 2;
                } elseif ($retryAfter === null && $exception->status === 429) {
                    $retryAfter = 5;
                }

                if ($retryAfter !== null) {
                    $retryAfterAt = now()->addSeconds(max(0, $retryAfter));
                    $retryMessage = " Please retry in {$retryAfter} seconds.";
                }
            }

            $generation->forceFill([
                'status' => 'failed',
                'provider_error_code' => $exception->providerCode ?? 'provider_rejected',
                'provider_error_message' => $exception->getMessage().$retryMessage,
                'actual_provider_cost_nanos' => 0,
                'actual_customer_charge_nanos' => 0,
                'completed_at' => now(),
                'retry_after_at' => $retryAfterAt,
            ])->save();
            $this->creditAccount->settleGeneration($generation, 0);

            return redirect()->route('generations.index')->with('error', $exception->getMessage());
        } catch (ConnectionException $exception) {
            $generation->forceFill([
                'provider_error_code' => 'connection_uncertain',
                'provider_error_message' => 'The submission could not be confirmed. Retry safely to check the original request.',
            ])->save();

            Log::warning('Pixelforge generation submission could not be confirmed.', [
                'generation_id' => $generation->id,
            ]);

            return redirect()->route('generations.index')->with('warning', $generation->provider_error_message);
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array<int, string>  $referenceImages
     */
    private function handleDuplicateSubmission(
        Generation $generation,
        array $validated,
        array $referenceImages,
    ): RedirectResponse {
        $matchesOriginalRequest = $generation->prompt === $validated['prompt'] &&
            $generation->size === $validated['size'] &&
            $generation->quality === $validated['quality'] &&
            $generation->reference_images === $referenceImages;

        if (! $matchesOriginalRequest) {
            abort(409, 'This submission token has already been used for a different request.');
        }

        if ($generation->status === 'queued' && $generation->provider_generation_id === null) {
            return $this->submit($generation);
        }

        return redirect()->route('generations.index')->with('success', 'This generation was already submitted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Generation $generation): array
    {
        return [
            'id' => $generation->id,
            'prompt' => $generation->prompt,
            'size' => $generation->size,
            'quality' => $generation->quality,
            'reference_images' => $generation->reference_images,
            'status' => $generation->status,
            'estimated_provider_cost' => $this->costCalculator->formatNanos($generation->estimated_provider_cost_nanos),
            'estimated_customer_charge' => $this->costCalculator->formatNanos($generation->estimated_customer_charge_nanos),
            'actual_customer_charge' => $generation->actual_customer_charge_nanos === null
                ? null
                : $this->costCalculator->formatNanos($generation->actual_customer_charge_nanos),
            'image_url' => $generation->image_url,
            'provider_error_message' => $generation->provider_error_message,
            'can_retry' => $generation->provider_generation_id === null &&
                ($generation->status === 'queued' || in_array($generation->provider_error_code, [
                    'rate_limit_exceeded',
                    'concurrency_limit_exceeded',
                    'daily_limit_exceeded',
                    'overloaded',
                    'connection_uncertain',
                ], true)) &&
                ($generation->retry_after_at === null || $generation->retry_after_at->isPast()),
            'created_at' => $generation->created_at?->toIso8601String(),
            'completed_at' => $generation->completed_at?->toIso8601String(),
        ];
    }
}
