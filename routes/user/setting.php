<?php

use App\Http\Controllers\Web\User\UserSettingController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard/setting', 'as' => 'setting.'], function () {
    Route::get('', [UserSettingController::class, 'index'])->name('index');
});