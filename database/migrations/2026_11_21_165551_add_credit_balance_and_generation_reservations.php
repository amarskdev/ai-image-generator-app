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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('credit_balance_nanos')->default(0);
        });

        Schema::table('generations', function (Blueprint $table) {
            $table->unsignedBigInteger('maximum_customer_charge_nanos')->nullable();
            $table->uuid('credit_reservation_key')->nullable();
            $table->index('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generations', function (Blueprint $table) {
            $table->dropIndex(['completed_at']);
            $table->dropColumn(['maximum_customer_charge_nanos', 'credit_reservation_key']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('credit_balance_nanos');
        });
    }
};
