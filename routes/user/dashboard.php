<?php

use App\Http\Controllers\Web\User\UserDashboardController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard', 'as' => 'dashboard.'], function () {
    Route::get('', [UserDashboardController::class, 'index'])->name('index');
    Route::get('onboarding', [UserDashboardController::class, 'onboarding'])->name('onboarding');
    Route::post('create-checkout-session', [UserDashboardController::class, 'createCheckoutSession'])->name('create-checkout-session');
    Route::get('checkout-success', [UserDashboardController::class, 'checkoutSuccess'])->name('checkout.success');
    Route::post('subscribe', [UserDashboardController::class, 'subscribe'])->name('subscribe');
});
