<?php

use App\Http\Controllers\Web\Admin\AdminPlanController;
use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => 'auth:admin',
    'prefix' => 'dashboard/plan',
    'as' => 'plan.'
], function () {
    Route::get('', [AdminPlanController::class, 'index'])->name('index');
    Route::get('fetch', [AdminPlanController::class, 'fetch'])->name('fetch');
    Route::get('create', [AdminPlanController::class, 'create'])->name('create');
    Route::get('{id}', [AdminPlanController::class, 'show'])->name('show');
    Route::post('store', [AdminPlanController::class, 'store'])->name('store');
    Route::put('{id}', [AdminPlanController::class, 'update'])->name('update');
    Route::delete('{id}', [AdminPlanController::class, 'destroy'])->name('destroy');
    Route::post('destroy-bulky', [AdminPlanController::class, 'destroyBulky'])->name('destroy-bulky');
});
