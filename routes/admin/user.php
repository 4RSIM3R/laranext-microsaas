<?php

use App\Http\Controllers\Web\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => 'auth:admin',
    'prefix' => 'dashboard/user',
    'as' => 'user.'
], function () {
    Route::get('', [AdminUserController::class, 'index'])->name('index');
    Route::get('fetch', [AdminUserController::class, 'fetch'])->name('fetch');
    Route::get('{id}', [AdminUserController::class, 'show'])->name('show');
    Route::put('{id}', [AdminUserController::class, 'update'])->name('update');
});
