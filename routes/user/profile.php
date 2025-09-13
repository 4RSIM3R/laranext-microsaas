<?php

use App\Http\Controllers\Web\User\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard/profile', 'as' => 'profile.'], function () {
    Route::get('', [UserProfileController::class, 'index'])->name('index');
    Route::post('update', [UserProfileController::class, 'update'])->name('update');
    Route::post('update-password', [UserProfileController::class, 'updatePassword'])->name('update-password');
});