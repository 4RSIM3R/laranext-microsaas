<?php

use App\Http\Controllers\Web\Admin\AdminSubcriptionController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:admin', 'prefix' => 'dashboard/subcription', 'as' => 'subcription.'], function () {
    Route::get('', [AdminSubcriptionController::class, 'index'])->name('index');
    Route::get('fetch', [AdminSubcriptionController::class, 'fetch'])->name('fetch');
    Route::get('stats', [AdminSubcriptionController::class, 'stats'])->name('stats');
    Route::get('{id}', [AdminSubcriptionController::class, 'show'])->name('show');
});
