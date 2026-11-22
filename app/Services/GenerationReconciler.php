<?php

namespace App\Services;

use App\Models\Generation;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;

class GenerationReconciler
{
    public function __construct(
        private readonly PixelforgeClient $pixelforge,
        private readonly GenerationStateUpdater $stateUpdater,
    ) {}

    public function reconcileFor(User $user): void
    {
        $generations = $user->generations()
            ->whereIn('status', ['queued', 'processing'])
            ->whereNotNull('provider_generation_id')
            ->where(function ($query): void {
                $query->whereNull('last_polled_at')
                    ->orWhere('last_polled_at', '<=', now()->subSeconds(30));
            })
            ->oldest('last_polled_at')
            ->limit(3)
            ->get();

        foreach ($generations as $generation) {
            $updated = Generation::query()
                ->whereKey($generation->getKey())
                ->whereIn('status', ['queued', 'processing'])
                ->where(function ($query): void {
                    $query->whereNull('last_polled_at')
                        ->orWhere('last_polled_at', '<=', now()->subSeconds(30));
                })
                ->update(['last_polled_at' => now()]);

            if ($updated === 0) {
                continue;
            }

            try {
                $providerGeneration = $this->pixelforge->retrieveGeneration($generation->provider_generation_id);
                $this->stateUpdater->apply($generation, $providerGeneration);
            } catch (PixelforgeApiException $exception) {
                Log::warning('Pixelforge generation reconciliation failed.', [
                    'generation_id' => $generation->id,
                    'provider_code' => $exception->providerCode,
                    'status' => $exception->status,
                ]);
            } catch (ConnectionException $exception) {
                Log::warning('Pixelforge generation reconciliation could not connect.', [
                    'generation_id' => $generation->id,
                ]);
            }
        }
    }
}
