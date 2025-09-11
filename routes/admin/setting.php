<?php

use App\Http\Controllers\Web\Admin\AdminSettingController;
use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => 'auth:admin',
    'prefix' => 'dashboard/setting',
    'as' => 'setting.'
], function () {
    Route::get('', [AdminSettingController::class, 'index'])->name('index');
    Route::get('fetch', [AdminSettingController::class, 'fetch'])->name('fetch');
    Route::get('create', [AdminSettingController::class, 'create'])->name('create');
    Route::get('{id}', [AdminSettingController::class, 'show'])->name('show');
    Route::post('store', [AdminSettingController::class, 'store'])->name('store');
    Route::put('{id}', [AdminSettingController::class, 'update'])->name('update');
    Route::delete('{id}', [AdminSettingController::class, 'destroy'])->name('destroy');
    Route::post('destroy-bulky', [AdminSettingController::class, 'destroyBulky'])->name('destroy-bulky');
});
