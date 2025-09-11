<?php

use App\Http\Controllers\Web\User\UserDashboardController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard', 'as' => 'dashboard.'], function () {
    Route::get('', [UserDashboardController::class, 'index'])->name('index');
    Route::get('onboarding', [UserDashboardController::class, 'onboarding'])->name('onboarding');
    Route::post('subscribe', [UserDashboardController::class, 'subscribe'])->name('subscribe');
});
