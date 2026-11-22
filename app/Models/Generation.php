<?php

namespace App\Models;

use Database\Factories\GenerationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Generation extends Model
{
    /** @use HasFactory<GenerationFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'client_request_id',
        'idempotency_key',
        'provider_generation_id',
        'prompt',
        'size',
        'quality',
        'reference_images',
        'status',
        'provider_rates',
        'estimated_provider_cost_nanos',
        'estimated_customer_charge_nanos',
        'maximum_customer_charge_nanos',
        'credit_reservation_key',
        'actual_provider_cost_nanos',
        'actual_customer_charge_nanos',
        'image_url',
        'provider_error_code',
        'provider_error_message',
        'submitted_at',
        'completed_at',
        'last_polled_at',
        'retry_after_at',
    ];

    protected function casts(): array
    {
        return [
            'reference_images' => 'array',
            'provider_rates' => 'array',
            'estimated_provider_cost_nanos' => 'integer',
            'estimated_customer_charge_nanos' => 'integer',
            'actual_provider_cost_nanos' => 'integer',
            'actual_customer_charge_nanos' => 'integer',
            'submitted_at' => 'datetime',
            'completed_at' => 'datetime',
            'last_polled_at' => 'datetime',
            'retry_after_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cost(): HasOne
    {
        return $this->hasOne(GenerationCost::class);
    }
}
