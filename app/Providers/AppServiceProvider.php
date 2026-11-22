<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('view-pixelforge-report', fn (User $user): bool => in_array(
            mb_strtolower($user->email),
            config('services.pixelforge.operator_emails', []),
            true,
        ));
    }
}
