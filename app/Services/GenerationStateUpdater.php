<?php

namespace App\Services;

use App\Models\Generation;
use App\Models\GenerationCost;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class GenerationStateUpdater
{
    public function __construct(
        private readonly GenerationCostCalculator $costCalculator,
        private readonly CreditAccountService $creditAccount,
    ) {}

    /**
     * @param  array<string, mixed>  $providerGeneration
     */
    public function apply(Generation $generation, array $providerGeneration): void
    {
        DB::transaction(function () use ($generation, $providerGeneration): void {
            $lockedGeneration = Generation::query()
                ->whereKey($generation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $providerId = $providerGeneration['id'] ?? null;
            $providerStatus = $providerGeneration['status'] ?? null;

            if (! is_string($providerId) || ! is_string($providerStatus)) {
                throw new InvalidArgumentException('Pixelforge returned an incomplete generation state.');
            }

            if ($lockedGeneration->provider_generation_id !== null &&
                $lockedGeneration->provider_generation_id !== $providerId) {
                throw new InvalidArgumentException('Pixelforge returned a different generation identifier.');
            }

            $lockedGeneration->provider_generation_id = $providerId;

            if (in_array($lockedGeneration->status, ['succeeded', 'failed'], true)) {
                $lockedGeneration->save();

                return;
            }

            $allowedTransitions = [
                'queued' => ['queued', 'processing', 'succeeded', 'failed'],
                'processing' => ['processing', 'succeeded', 'failed'],
            ];

            if (! in_array($providerStatus, $allowedTransitions[$lockedGeneration->status] ?? [], true)) {
                throw new InvalidArgumentException('Pixelforge returned an unsupported generation state transition.');
            }

            $lockedGeneration->status = $providerStatus;
            $lockedGeneration->provider_rates = is_array($providerGeneration['rates'] ?? null)
                ? $providerGeneration['rates']
                : $lockedGeneration->provider_rates;

            if ($providerStatus === 'succeeded') {
                $usage = $providerGeneration['usage'] ?? null;
                $rates = $providerGeneration['rates'] ?? $lockedGeneration->provider_rates;

                if (! is_array($usage) || ! is_array($rates)) {
                    throw new InvalidArgumentException('Pixelforge omitted successful generation usage or rates.');
                }

                $cost = $this->costCalculator->costFromUsage($usage, $rates);

                $lockedGeneration->actual_provider_cost_nanos = $cost['provider'];
                $lockedGeneration->actual_customer_charge_nanos = $cost['customer'];
                $lockedGeneration->image_url = is_string($providerGeneration['image_url'] ?? null)
                    ? $providerGeneration['image_url']
                    : null;
                $lockedGeneration->completed_at = $this->providerTimestamp($providerGeneration['completed_at'] ?? null);

                GenerationCost::query()->updateOrCreate(
                    ['generation_id' => $lockedGeneration->id],
                    [
                        'provider_cost_nanos' => $cost['provider'],
                        'customer_charge_nanos' => $cost['customer'],
                        'currency' => 'USD',
                    ],
                );
            }

            if ($providerStatus === 'failed') {
                $error = is_array($providerGeneration['error'] ?? null) ? $providerGeneration['error'] : [];
                $lockedGeneration->actual_provider_cost_nanos = 0;
                $lockedGeneration->actual_customer_charge_nanos = 0;
                $lockedGeneration->provider_error_code = is_string($error['code'] ?? null) ? $error['code'] : 'generation_failed';
                $lockedGeneration->provider_error_message = is_string($error['message'] ?? null)
                    ? $error['message']
                    : 'Pixelforge could not generate this image. You were not charged.';
                $lockedGeneration->completed_at = $this->providerTimestamp($providerGeneration['completed_at'] ?? null);
            }

            $lockedGeneration->save();

            if ($providerStatus === 'succeeded') {
                $this->creditAccount->settleGeneration(
                    $lockedGeneration,
                    $lockedGeneration->actual_customer_charge_nanos ?? 0,
                );
            } elseif ($providerStatus === 'failed') {
                $this->creditAccount->settleGeneration($lockedGeneration, 0);
            }
        });
    }

    private function providerTimestamp(mixed $timestamp): Carbon
    {
        if (! is_string($timestamp)) {
            return now();
        }

        return Carbon::parse($timestamp);
    }
}
