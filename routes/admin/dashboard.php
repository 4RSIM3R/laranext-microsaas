<?php

use App\Http\Controllers\Web\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:admin', 'as' => 'dashboard.'], function () {
    Route::get('', [AdminDashboardController::class, 'index'])->name('index');
});