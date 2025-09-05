<?php

use App\Http\Controllers\Web\User\UserAuthController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'guest', 'prefix' => 'user', 'as' => 'auth.'], function () {
    Route::get('login', [UserAuthController::class, 'login'])->name('login');
    Route::post('login', [UserAuthController::class, 'authenticate'])->name('authenticate');

    Route::get('register', [UserAuthController::class, 'register'])->name('register');
    Route::post('register', [UserAuthController::class, 'store'])->name('store');

    Route::group(['middleware' => 'auth'], function () {
        Route::post('logout', [UserAuthController::class, 'logout'])->name('logout');
    });
});