<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenerationCost extends Model
{
    protected $fillable = [
        'generation_id',
        'provider_cost_nanos',
        'customer_charge_nanos',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'provider_cost_nanos' => 'integer',
            'customer_charge_nanos' => 'integer',
        ];
    }

    public function generation(): BelongsTo
    {
        return $this->belongsTo(Generation::class);
    }
}
