<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use UnexpectedValueException;

class PixelforgeClient
{
    /**
     * @return array<string, mixed>
     */
    public function pricing(): array
    {
        $response = Http::acceptJson()
            ->connectTimeout(3)
            ->timeout(8)
            ->get($this->baseUrl().'/pricing');

        if (! $response->successful()) {
            throw $this->exceptionFromResponse($response->status(), $response->json(), $response->header('Retry-After'));
        }

        $pricing = $response->json();

        if (! is_array($pricing) || ! is_array($pricing['rates'] ?? null) || ! is_array($pricing['tokens'] ?? null)) {
            throw new UnexpectedValueException('Pixelforge returned an invalid pricing response.');
        }

        return $pricing;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createGeneration(array $payload, string $idempotencyKey): array
    {
        return $this->decodeGenerationResponse(
            $this->authenticatedRequest()
                ->withHeader('Idempotency-Key', $idempotencyKey)
                ->post('generations', $payload),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function retrieveGeneration(string $providerGenerationId): array
    {
        return $this->decodeGenerationResponse(
            $this->authenticatedRequest()->get('generations/'.rawurlencode($providerGenerationId)),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function usage(string $startDate, string $endDate): array
    {
        $response = $this->authenticatedRequest()->get('usage', [
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        if (! $response->successful()) {
            throw $this->exceptionFromResponse($response->status(), $response->json(), $response->header('Retry-After'));
        }

        $usage = $response->json();

        if (! is_array($usage) || ! is_array($usage['data'] ?? null)) {
            throw new UnexpectedValueException('Pixelforge returned an invalid usage response.');
        }

        foreach ($usage['data'] as $day) {
            if (! is_array($day) || ! is_string($day['date'] ?? null) ||
                ! is_int($day['generations'] ?? null) || ! is_string($day['cost_usd'] ?? null)) {
                throw new UnexpectedValueException('Pixelforge returned an invalid daily usage record.');
            }
        }

        return $usage;
    }

    private function authenticatedRequest(): PendingRequest
    {
        $apiKey = config('services.pixelforge.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new UnexpectedValueException('The Pixelforge API key is not configured.');
        }

        return Http::baseUrl($this->baseUrl().'/')
            ->acceptJson()
            ->withToken($apiKey)
            ->connectTimeout(3)
            ->timeout(10);
    }

    private function baseUrl(): string
    {
        $baseUrl = config('services.pixelforge.api_url');

        if (! is_string($baseUrl) || filter_var($baseUrl, FILTER_VALIDATE_URL) === false) {
            throw new UnexpectedValueException('The Pixelforge API URL is not configured correctly.');
        }

        return rtrim($baseUrl, '/');
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeGenerationResponse(Response $response): array
    {
        if (! $response->successful()) {
            throw $this->exceptionFromResponse($response->status(), $response->json(), $response->header('Retry-After'));
        }

        $generation = $response->json();

        if (! is_array($generation) || ! is_string($generation['id'] ?? null) || ! is_string($generation['status'] ?? null)) {
            throw new UnexpectedValueException('Pixelforge returned an invalid generation response.');
        }

        return $generation;
    }

    private function exceptionFromResponse(int $status, mixed $payload, ?string $retryAfter): PixelforgeApiException
    {
        $error = is_array($payload) && is_array($payload['error'] ?? null) ? $payload['error'] : [];
        $message = is_string($error['message'] ?? null) ? $error['message'] : 'Pixelforge could not process the request.';

        return new PixelforgeApiException(
            $message,
            $status,
            is_string($error['code'] ?? null) ? $error['code'] : null,
            is_numeric($retryAfter) ? (int) $retryAfter : null,
        );
    }
}
