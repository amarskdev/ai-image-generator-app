<?php

use App\Http\Controllers\CreditPurchaseController;
use App\Http\Controllers\GenerationController;
use App\Http\Controllers\PixelforgeUsageReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', [GenerationController::class, 'index'])->name('dashboard');
    Route::get('/generations', [GenerationController::class, 'history'])->name('generations.index');
    Route::post('/generations', [GenerationController::class, 'store'])->middleware('throttle:10,1')->name('generations.store');
    Route::post('/generations/{generation}/retry', [GenerationController::class, 'retry'])->middleware('throttle:10,1')->name('generations.retry');
    Route::post('/credits/purchase', CreditPurchaseController::class)->middleware('throttle:10,1')->name('credits.purchase');
    Route::get('/admin/pixelforge/usage', PixelforgeUsageReportController::class)
        ->name('admin.pixelforge.usage');
});
