<?php

use App\Http\Controllers\Web\Admin\AdminTransactionController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:admin', 'prefix' => 'dashboard/transaction', 'as' => 'transaction.'], function () {
    Route::get('', [AdminTransactionController::class, 'index'])->name('index');
    Route::get('fetch', [AdminTransactionController::class, 'fetch'])->name('fetch');
    Route::get('{id}', [AdminTransactionController::class, 'show'])->name('show');
});