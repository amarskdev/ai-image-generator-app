<?php

namespace App\Services;

class WebhookVerifier
{
    public function verify(string $rawBody, ?string $signatureHeader, string $secret, ?int $now = null): bool
    {
        if ($signatureHeader === null || $signatureHeader === '') {
            return false;
        }

        $signatureParts = [];

        foreach (explode(',', $signatureHeader) as $part) {
            $pair = explode('=', trim($part), 2);

            if (count($pair) === 2) {
                $signatureParts[$pair[0]] = $pair[1];
            }
        }

        $timestamp = $signatureParts['t'] ?? null;
        $signature = $signatureParts['v1'] ?? null;

        if (! is_string($timestamp) || strlen($timestamp) > 10 || ! ctype_digit($timestamp) ||
            ! is_string($signature) || ! preg_match('/^[a-f0-9]{64}$/i', $signature)) {
            return false;
        }

        if (abs(($now ?? time()) - (int) $timestamp) > 300) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$rawBody, $secret);

        return hash_equals($expected, strtolower($signature));
    }
}
