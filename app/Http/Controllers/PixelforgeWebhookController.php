<?php

namespace App\Http\Controllers;

use App\Models\Generation;
use App\Models\GenerationEvent;
use App\Services\GenerationStateUpdater;
use App\Services\WebhookVerifier;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use JsonException;
use Symfony\Component\HttpFoundation\Response;

class PixelforgeWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        WebhookVerifier $verifier,
        GenerationStateUpdater $stateUpdater,
    ): Response {
        $secret = config('services.pixelforge.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            Log::error('Pixelforge webhook signing secret is not configured.');

            return response('Webhook signing secret is not configured.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $rawBody = $request->getContent();

        if (strlen($rawBody) > 1_048_576) {
            return response('Invalid Pixelforge signature.', Response::HTTP_BAD_REQUEST);
        }

        if (! $verifier->verify($rawBody, $request->header('Pixelforge-Signature'), $secret)) {
            return response('Invalid Pixelforge signature.', Response::HTTP_BAD_REQUEST);
        }

        try {
            $payload = json_decode($rawBody, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return response('Invalid webhook body.', Response::HTTP_BAD_REQUEST);
        }

        if (! is_array($payload) ||
            ! is_string($payload['id'] ?? null) ||
            ! is_string($payload['type'] ?? null) ||
            $payload['id'] !== $request->header('Pixelforge-Event-Id') ||
            $payload['type'] !== $request->header('Pixelforge-Event-Type')) {
            return response('Invalid Pixelforge event.', Response::HTTP_BAD_REQUEST);
        }

        try {
            DB::transaction(function () use ($payload, $stateUpdater): void {
                $event = GenerationEvent::query()->create([
                    'provider_event_id' => $payload['id'],
                    'event_type' => $payload['type'],
                    'payload' => $payload,
                ]);

                $expectedStatuses = [
                    'generation.processing' => 'processing',
                    'generation.succeeded' => 'succeeded',
                    'generation.failed' => 'failed',
                ];
                $expectedStatus = $expectedStatuses[$payload['type']] ?? null;

                if ($expectedStatus !== null) {
                    $providerGeneration = $payload['data']['object'] ?? null;

                    if (! is_array($providerGeneration) || ($providerGeneration['status'] ?? null) !== $expectedStatus) {
                        abort(Response::HTTP_BAD_REQUEST, 'Invalid Pixelforge generation event.');
                    }

                    $generation = $this->findGeneration($providerGeneration);

                    if ($generation !== null) {
                        $stateUpdater->apply($generation, $providerGeneration);
                        $event->generation()->associate($generation);
                    }
                }

                $event->forceFill(['processed_at' => now()])->save();
            });
        } catch (UniqueConstraintViolationException $exception) {
            if (GenerationEvent::query()->where('provider_event_id', $payload['id'])->exists()) {
                return response()->noContent();
            }

            throw $exception;
        }

        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $providerGeneration
     */
    private function findGeneration(array $providerGeneration): ?Generation
    {
        $providerId = $providerGeneration['id'] ?? null;
        $localId = $providerGeneration['metadata']['application_generation_id'] ?? null;
        $generation = is_string($providerId)
            ? Generation::query()->where('provider_generation_id', $providerId)->first()
            : null;

        if ($generation === null && is_string($localId)) {
            $generation = Generation::query()->whereKey($localId)->first();
        }

        if ($generation !== null && is_string($providerId) &&
            $generation->provider_generation_id !== null &&
            $generation->provider_generation_id !== $providerId) {
            abort(Response::HTTP_BAD_REQUEST, 'Pixelforge generation identifier did not match.');
        }

        return $generation;
    }
}
