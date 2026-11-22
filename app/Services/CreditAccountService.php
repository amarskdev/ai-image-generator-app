<?php

namespace App\Services;

use App\Models\CreditTransaction;
use App\Models\Generation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use OverflowException;

class CreditAccountService
{
    public function purchase(User $user, int $amountNanos, string $idempotencyKey): void
    {
        if ($amountNanos <= 0) {
            throw new InvalidArgumentException('A credit purchase must be greater than zero.');
        }

        DB::transaction(function () use ($user, $amountNanos, $idempotencyKey): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);

            if ($amountNanos > PHP_INT_MAX - $lockedUser->credit_balance_nanos) {
                throw new OverflowException('The credit balance exceeds the supported range.');
            }

            $lockedUser->credit_balance_nanos += $amountNanos;
            $lockedUser->save();

            CreditTransaction::query()->create([
                'user_id' => $lockedUser->id,
                'type' => 'credit_purchase',
                'amount_nanos' => $amountNanos,
                'balance_after_nanos' => $lockedUser->credit_balance_nanos,
                'idempotency_key' => $idempotencyKey,
            ]);
        });
    }

    public function reserveForNewGeneration(
        User $lockedUser,
        Generation $generation,
        int $amountNanos,
        string $reservationKey,
    ): bool {
        if ($amountNanos < 0 || $lockedUser->credit_balance_nanos < $amountNanos) {
            return false;
        }

        $lockedUser->credit_balance_nanos -= $amountNanos;
        $lockedUser->save();

        CreditTransaction::query()->create([
            'user_id' => $lockedUser->id,
            'generation_id' => $generation->id,
            'type' => 'generation_reservation',
            'amount_nanos' => -$amountNanos,
            'balance_after_nanos' => $lockedUser->credit_balance_nanos,
            'idempotency_key' => $reservationKey,
        ]);

        $generation->forceFill(['credit_reservation_key' => $reservationKey])->save();

        return true;
    }

    public function reserveGeneration(Generation $generation, int $amountNanos): bool
    {
        return DB::transaction(function () use ($generation, $amountNanos): bool {
            $lockedGeneration = Generation::query()
                ->whereKey($generation->id)
                ->lockForUpdate()
                ->firstOrFail();

            $currentReservationKey = $lockedGeneration->credit_reservation_key;

            if ($currentReservationKey !== null &&
                ! CreditTransaction::query()
                    ->where('idempotency_key', 'settlement:'.$currentReservationKey)
                    ->exists()) {
                return true;
            }

            $lockedUser = User::query()->lockForUpdate()->findOrFail($lockedGeneration->user_id);

            if (! $this->reserveForNewGeneration(
                $lockedUser,
                $lockedGeneration,
                $amountNanos,
                (string) Str::uuid(),
            )) {
                return false;
            }

            return true;
        });
    }

    public function settleGeneration(Generation $generation, int $actualChargeNanos): void
    {
        DB::transaction(function () use ($generation, $actualChargeNanos): void {
            $lockedGeneration = Generation::query()
                ->whereKey($generation->id)
                ->lockForUpdate()
                ->firstOrFail();
            $reservationKey = $lockedGeneration->credit_reservation_key;

            if ($reservationKey === null) {
                return;
            }

            $settlementKey = 'settlement:'.$reservationKey;

            if (CreditTransaction::query()->where('idempotency_key', $settlementKey)->exists()) {
                return;
            }

            $reservation = CreditTransaction::query()
                ->where('idempotency_key', $reservationKey)
                ->where('generation_id', $lockedGeneration->id)
                ->lockForUpdate()
                ->firstOrFail();
            $reservedNanos = abs($reservation->amount_nanos);
            $refundNanos = $reservedNanos - $actualChargeNanos;

            if ($actualChargeNanos < 0 || $refundNanos < 0) {
                throw new InvalidArgumentException('The final charge exceeds the generation credit reservation.');
            }

            $lockedUser = User::query()->lockForUpdate()->findOrFail($lockedGeneration->user_id);

            if ($refundNanos > PHP_INT_MAX - $lockedUser->credit_balance_nanos) {
                throw new OverflowException('The credit balance exceeds the supported range.');
            }

            $lockedUser->credit_balance_nanos += $refundNanos;
            $lockedUser->save();

            CreditTransaction::query()->create([
                'user_id' => $lockedUser->id,
                'generation_id' => $lockedGeneration->id,
                'type' => 'generation_settlement',
                'amount_nanos' => $refundNanos,
                'balance_after_nanos' => $lockedUser->credit_balance_nanos,
                'idempotency_key' => $settlementKey,
            ]);
        });
    }
}
