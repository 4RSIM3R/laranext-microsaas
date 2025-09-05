<?php

use App\Http\Controllers\Web\User\UserAuthController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'guest', 'prefix' => 'user', 'as' => 'auth.'], function () {
    Route::get('login', [UserAuthController::class, 'login'])->name('login');
    Route::post('login', [UserAuthController::class, 'authenticate'])->name('authenticate');

    Route::get('register', [UserAuthController::class, 'register'])->name('register');
    Route::post('register', [UserAuthController::class, 'store'])->name('store');

    Route::get('verify-email', [UserAuthController::class, 'verify_email'])->name('verify-email');
    Route::get('resend-verification', [UserAuthController::class, 'resend_verification_page'])->name('resend-verification-page');
    Route::post('resend-verification', [UserAuthController::class, 'resend_verification'])->name('resend-verification');

    Route::get('forgot-password', [UserAuthController::class, 'forgot'])->name('forgot-password');
    Route::post('forgot-password', [UserAuthController::class, 'send_email'])->name('forgot-password.send-email');
    Route::get('change-password', [UserAuthController::class, 'change'])->name('change-password');
    Route::post('change-password', [UserAuthController::class, 'reset'])->name('change-password.reset');

    Route::group(['middleware' => 'auth'], function () {
        Route::post('logout', [UserAuthController::class, 'logout'])->name('logout');
    });
});
