<?php

use App\Http\Controllers\Web\User\UserDashboardController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard', 'as' => 'dashboard.'], function () {
    Route::get('', [UserDashboardController::class, 'index'])->name('index');
});
