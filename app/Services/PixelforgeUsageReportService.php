<?php

namespace App\Services;

use App\Models\GenerationCost;
use Carbon\CarbonImmutable;
use UnexpectedValueException;

class PixelforgeUsageReportService
{
    public function __construct(
        private readonly PixelforgeClient $pixelforge,
        private readonly GenerationCostCalculator $costCalculator,
    ) {}

    /**
     * @return array{daily: array<int, array<string, mixed>>, byUser: array<int, array<string, mixed>>}
     */
    public function report(CarbonImmutable $startDate, CarbonImmutable $endDate): array
    {
        $localRows = GenerationCost::query()
            ->join('generations', 'generations.id', '=', 'generation_costs.generation_id')
            ->join('users', 'users.id', '=', 'generations.user_id')
            ->where('generations.completed_at', '>=', $startDate->startOfDay())
            ->where('generations.completed_at', '<', $endDate->addDay()->startOfDay())
            ->selectRaw('DATE(generations.completed_at) as date')
            ->selectRaw('users.id as user_id, users.name as user_name')
            ->selectRaw('COUNT(generation_costs.id) as generation_count')
            ->selectRaw('SUM(generation_costs.provider_cost_nanos) as provider_cost_nanos')
            ->selectRaw('SUM(generation_costs.customer_charge_nanos) as customer_charge_nanos')
            ->groupByRaw('DATE(generations.completed_at), users.id, users.name')
            ->orderBy('date')
            ->orderBy('user_name')
            ->get();

        $daily = [];
        for ($date = $startDate; $date->lte($endDate); $date = $date->addDay()) {
            $day = $date->toDateString();
            $daily[$day] = [
                'date' => $day,
                'generations' => 0,
                'provider_reported_nanos' => 0,
                'provider_recorded_nanos' => 0,
                'customer_charge_nanos' => 0,
            ];
        }

        $byUser = $localRows->map(function (object $row) use (&$daily): array {
            $providerCost = (int) $row->provider_cost_nanos;
            $customerCharge = (int) $row->customer_charge_nanos;
            $daily[$row->date]['provider_recorded_nanos'] += $providerCost;
            $daily[$row->date]['customer_charge_nanos'] += $customerCharge;

            return [
                'date' => $row->date,
                'user_id' => (int) $row->user_id,
                'user_name' => $row->user_name,
                'generations' => (int) $row->generation_count,
                'provider_cost_nanos' => $providerCost,
                'customer_charge_nanos' => $customerCharge,
                'profit_nanos' => $customerCharge - $providerCost,
            ];
        })->all();

        $usage = $this->pixelforge->usage($startDate->toDateString(), $endDate->toDateString());

        foreach ($usage['data'] as $usageDay) {
            if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $usageDay['date']) ||
                ! array_key_exists($usageDay['date'], $daily)) {
                throw new UnexpectedValueException('Pixelforge returned usage outside the requested date range.');
            }

            $daily[$usageDay['date']]['generations'] = $usageDay['generations'];
            $daily[$usageDay['date']]['provider_reported_nanos'] = $this->costCalculator->usdToNanos($usageDay['cost_usd']);
        }

        $daily = array_values(array_map(function (array $day): array {
            $day['reconciliation_difference_nanos'] =
                $day['provider_recorded_nanos'] - $day['provider_reported_nanos'];
            $day['provider_reported'] = $this->costCalculator->formatNanos($day['provider_reported_nanos']);
            $day['provider_recorded'] = $this->costCalculator->formatNanos($day['provider_recorded_nanos']);
            $day['customer_charge'] = $this->costCalculator->formatNanos($day['customer_charge_nanos']);
            $day['profit'] = $this->costCalculator->formatNanos(
                $day['customer_charge_nanos'] - $day['provider_recorded_nanos'],
            );
            $day['reconciliation_difference'] = $this->costCalculator->formatNanos(
                $day['reconciliation_difference_nanos'],
            );

            return $day;
        }, $daily));

        $byUser = array_map(function (array $row): array {
            $row['provider_cost'] = $this->costCalculator->formatNanos($row['provider_cost_nanos']);
            $row['customer_charge'] = $this->costCalculator->formatNanos($row['customer_charge_nanos']);
            $row['profit'] = $this->costCalculator->formatNanos($row['profit_nanos']);

            return $row;
        }, $byUser);

        return [
            'daily' => $daily,
            'byUser' => $byUser,
        ];
    }
}
