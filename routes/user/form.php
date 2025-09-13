<?php

use App\Http\Controllers\Web\User\UserFormController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard/form', 'as' => 'form.'], function () {
    Route::get('', [UserFormController::class, 'index'])->name('index');
});