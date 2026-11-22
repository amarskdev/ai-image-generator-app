<?php

use App\Http\Controllers\PixelforgeWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/pixelforge/webhooks', PixelforgeWebhookController::class)
    ->name('pixelforge.webhooks');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
