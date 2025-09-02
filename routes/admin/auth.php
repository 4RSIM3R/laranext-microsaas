<?php

use App\Http\Controllers\Web\Admin\AdminAuthController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'guest', 'prefix' => 'auth', 'as' => 'auth.'], function () {
    Route::get('login', [AdminAuthController::class, 'login'])->name('login');
    Route::post('login', [AdminAuthController::class, 'authenticate'])->name('authenticate');

    Route::group(['middleware' => 'auth'], function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
    });
});