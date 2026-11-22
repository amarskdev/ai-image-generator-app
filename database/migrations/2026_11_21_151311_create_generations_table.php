<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('generations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('idempotency_key')->unique();
            $table->string('provider_generation_id')->nullable()->unique();
            $table->text('prompt');
            $table->string('size', 20);
            $table->string('quality', 10);
            $table->json('reference_images');
            $table->string('status', 20)->default('queued');
            $table->json('provider_rates')->nullable();
            $table->unsignedBigInteger('estimated_provider_cost_nanos');
            $table->unsignedBigInteger('estimated_customer_charge_nanos');
            $table->unsignedBigInteger('actual_provider_cost_nanos')->nullable();
            $table->unsignedBigInteger('actual_customer_charge_nanos')->nullable();
            $table->text('image_url')->nullable();
            $table->string('provider_error_code')->nullable();
            $table->text('provider_error_message')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_polled_at')->nullable();
            $table->timestamp('retry_after_at')->nullable();
            $table->index(['user_id', 'created_at']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generations');
    }
};
