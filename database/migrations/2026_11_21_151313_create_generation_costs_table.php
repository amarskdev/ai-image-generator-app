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
        Schema::create('generation_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('generation_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('provider_cost_nanos');
            $table->unsignedBigInteger('customer_charge_nanos');
            $table->string('currency', 3)->default('USD');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generation_costs');
    }
};
