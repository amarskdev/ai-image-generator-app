<?php

namespace App\Services;

use InvalidArgumentException;

class GenerationCostCalculator
{
    private const NANODOLLARS_PER_DOLLAR = 1_000_000_000;

    private const TOKENS_PER_MILLION = 1_000_000;

    /**
     * @param  array<string, mixed>  $rates
     * @param  array<string, mixed>  $tokens
     * @return array{provider: int, customer: int}
     */
    public function estimate(
        string $prompt,
        int $referenceImageCount,
        string $quality,
        string $size,
        array $rates,
        array $tokens,
    ): array {
        $outputTokens = $this->nonNegativeInteger($tokens['output'][$quality][$size] ?? null);
        $reasoningRange = $tokens['reasoning'][$quality] ?? null;
        $referenceImageTokens = $this->nonNegativeInteger($tokens['per_reference_image'] ?? null);
        $minimumReasoningTokens = is_array($reasoningRange)
            ? $this->nonNegativeInteger($reasoningRange['min'] ?? null)
            : null;
        $maximumReasoningTokens = is_array($reasoningRange)
            ? $this->nonNegativeInteger($reasoningRange['max'] ?? null)
            : null;

        if ($outputTokens === null || $referenceImageTokens === null ||
            $minimumReasoningTokens === null || $maximumReasoningTokens === null ||
            $maximumReasoningTokens < $minimumReasoningTokens || $referenceImageCount < 0) {
            throw new InvalidArgumentException('Pixelforge pricing does not include estimates for this image configuration.');
        }

        $charactersPerTextToken = $this->nonNegativeInteger($tokens['characters_per_text_token'] ?? 4);

        if ($charactersPerTextToken === null || $charactersPerTextToken === 0) {
            throw new InvalidArgumentException('Pixelforge pricing does not include text token estimates.');
        }

        $textTokenEstimate = (int) ceil(mb_strlen($prompt, 'UTF-8') / $charactersPerTextToken);

        $usage = [
            'input_text_tokens' => $textTokenEstimate,
            'input_image_tokens' => $referenceImageCount * $referenceImageTokens,
            'output_tokens' => $outputTokens,
            'reasoning_tokens' => intdiv($minimumReasoningTokens + $maximumReasoningTokens, 2),
        ];

        return $this->costFromUsage($usage, $rates);
    }

    /**
     * @param  array<string, mixed>  $rates
     * @param  array<string, mixed>  $tokens
     * @return array{provider: int, customer: int}
     */
    public function maximumCharge(
        string $prompt,
        int $referenceImageCount,
        string $quality,
        string $size,
        array $rates,
        array $tokens,
    ): array {
        $outputTokens = $this->nonNegativeInteger($tokens['output'][$quality][$size] ?? null);
        $reasoningRange = $tokens['reasoning'][$quality] ?? null;
        $referenceImageTokens = $this->nonNegativeInteger($tokens['per_reference_image'] ?? null);
        $maximumReasoningTokens = is_array($reasoningRange)
            ? $this->nonNegativeInteger($reasoningRange['max'] ?? null)
            : null;
        $charactersPerTextToken = $this->nonNegativeInteger($tokens['characters_per_text_token'] ?? 4);
        $variance = $tokens['text_token_variance'] ?? '0.15';
        $varianceString = is_int($variance) || is_float($variance) || is_string($variance)
            ? (string) $variance
            : '';

        if ($outputTokens === null || $referenceImageTokens === null ||
            $maximumReasoningTokens === null || $charactersPerTextToken === null ||
            $charactersPerTextToken === 0 ||
            ! preg_match('/^(0|1)(?:\.(\d{1,6}))?$/', $varianceString, $varianceParts)) {
            throw new InvalidArgumentException('Pixelforge pricing does not include a maximum charge for this image configuration.');
        }

        $varianceFraction = $varianceParts[2] ?? '';
        $varianceScale = 10 ** strlen($varianceFraction);
        $varianceNumerator = ((int) $varianceParts[1] * $varianceScale) +
            (int) str_pad($varianceFraction, strlen($varianceFraction), '0');

        if ($varianceNumerator > $varianceScale) {
            throw new InvalidArgumentException('Pixelforge returned an invalid text token variance.');
        }

        $estimatedTextTokens = (int) ceil(mb_strlen($prompt, 'UTF-8') / $charactersPerTextToken);
        $maximumTextTokens = intdiv(
            ($estimatedTextTokens * ($varianceScale + $varianceNumerator)) + $varianceScale - 1,
            $varianceScale,
        );

        return $this->costFromUsage([
            'input_text_tokens' => $maximumTextTokens,
            'input_image_tokens' => $referenceImageCount * $referenceImageTokens,
            'output_tokens' => $outputTokens,
            'reasoning_tokens' => $maximumReasoningTokens,
        ], $rates);
    }

    /**
     * @param  array<string, mixed>  $usage
     * @param  array<string, mixed>  $rates
     * @return array{provider: int, customer: int}
     */
    public function costFromUsage(array $usage, array $rates): array
    {
        $providerNanos = 0;

        foreach (['input_text_tokens', 'input_image_tokens', 'output_tokens', 'reasoning_tokens'] as $tokenType) {
            $count = $usage[$tokenType] ?? null;
            $rate = $rates[$tokenType] ?? null;

            $tokenCount = $this->nonNegativeInteger($count);

            if ($tokenCount === null || ! is_string($rate)) {
                throw new InvalidArgumentException('Pixelforge returned incomplete token usage or rates.');
            }

            $rateNanos = $this->usdToNanos($rate);

            if ($rateNanos % self::TOKENS_PER_MILLION !== 0) {
                throw new InvalidArgumentException('Pixelforge rates cannot be represented exactly in nanodollars per token.');
            }

            $tokenCostNanos = intdiv($rateNanos, self::TOKENS_PER_MILLION);

            if ($tokenCostNanos > 0 && $tokenCount > intdiv(PHP_INT_MAX - $providerNanos, $tokenCostNanos)) {
                throw new InvalidArgumentException('Pixelforge usage exceeds the supported cost range.');
            }

            $providerNanos += $tokenCount * $tokenCostNanos;
        }

        $markupNumerator = (int) config('services.pixelforge.markup_numerator', 5);
        $markupDenominator = (int) config('services.pixelforge.markup_denominator', 4);

        if ($providerNanos > intdiv(PHP_INT_MAX, $markupNumerator)) {
            throw new InvalidArgumentException('Pixelforge usage exceeds the supported customer charge range.');
        }

        $customerNanos = intdiv($providerNanos * $markupNumerator + intdiv($markupDenominator, 2), $markupDenominator);

        return [
            'provider' => $providerNanos,
            'customer' => $customerNanos,
        ];
    }

    public function usdToNanos(string $amount): int
    {
        if (! preg_match('/^(0|[1-9]\d*)(?:\.(\d{1,9}))?$/', $amount, $matches) ||
            strlen($matches[1]) > 9) {
            throw new InvalidArgumentException('Pixelforge returned a malformed USD amount.');
        }

        $fraction = str_pad($matches[2] ?? '', 9, '0');

        return ((int) $matches[1] * self::NANODOLLARS_PER_DOLLAR) + (int) $fraction;
    }

    public function formatNanos(int $amount): string
    {
        $sign = $amount < 0 ? '-' : '';
        $absoluteAmount = abs($amount);
        $dollars = intdiv($absoluteAmount, self::NANODOLLARS_PER_DOLLAR);
        $nanos = $absoluteAmount % self::NANODOLLARS_PER_DOLLAR;

        return $sign.$dollars.'.'.str_pad((string) $nanos, 9, '0', STR_PAD_LEFT);
    }

    private function nonNegativeInteger(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value >= 0 ? $value : null;
        }

        if (! is_string($value) || ! ctype_digit($value)) {
            return null;
        }

        $integer = filter_var($value, FILTER_VALIDATE_INT);

        return is_int($integer) && $integer >= 0 ? $integer : null;
    }
}
