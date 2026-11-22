<?php

namespace App\Http\Controllers;

use App\Services\PixelforgeUsageReportService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PixelforgeUsageReportController extends Controller
{
    public function __invoke(Request $request, PixelforgeUsageReportService $report): Response
    {
        $validated = $request->validate([
            'start_date' => ['sometimes', 'required_with:end_date', 'date_format:Y-m-d'],
            'end_date' => ['sometimes', 'required_with:start_date', 'date_format:Y-m-d'],
        ]);

        $today = CarbonImmutable::now('UTC')->startOfDay();
        $endDate = isset($validated['end_date'])
            ? CarbonImmutable::parse($validated['end_date'], 'UTC')
            : $today;
        $startDate = isset($validated['start_date'])
            ? CarbonImmutable::parse($validated['start_date'], 'UTC')
            : $endDate->subDays(29);

        if ($endDate->gt($today)) {
            throw ValidationException::withMessages([
                'end_date' => 'The end date cannot be in the future.',
            ]);
        }

        if ($startDate->gt($endDate)) {
            throw ValidationException::withMessages([
                'start_date' => 'The start date must be on or before the end date.',
            ]);
        }

        if ($startDate->diffInDays($endDate) >= 92) {
            throw ValidationException::withMessages([
                'end_date' => 'Choose a date range of 92 days or fewer.',
            ]);
        }

        return Inertia::render('Admin/Usage/Index', [
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            ...$report->report($startDate, $endDate),
        ]);
    }
}
