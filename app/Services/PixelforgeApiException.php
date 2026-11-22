<?php

namespace App\Services;

use RuntimeException;

class PixelforgeApiException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $status,
        public readonly ?string $providerCode = null,
        public readonly ?int $retryAfter = null,
    ) {
        parent::__construct($message);
    }
}
