<?php

use App\Http\Controllers\Web\User\UserFormController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:user', 'prefix' => 'dashboard/form', 'as' => 'form.'], function () {
    Route::get('', [UserFormController::class, 'index'])->name('index');
    Route::get('fetch', [UserFormController::class, 'fetch'])->name('fetch');
    Route::get('create', [UserFormController::class, 'create'])->name('create');
    Route::post('store', [UserFormController::class, 'store'])->name('store');
    Route::get('{id}', [UserFormController::class, 'show'])->name('show');
    Route::get('{id}/detail', [UserFormController::class, 'detail'])->name('detail');
    Route::get('{id}/submissions', [UserFormController::class, 'submissions'])->name('submissions');
    Route::get('{id}/builder', [UserFormController::class, 'builder'])->name('builder');
    Route::post('{id}/generate-embed', [UserFormController::class, 'generateEmbed'])->name('generate-embed');
    Route::post('{id}/generate-custom-embed', [UserFormController::class, 'generateCustomEmbed'])->name('generate-custom-embed');
    Route::put('{id}', [UserFormController::class, 'update'])->name('update');
    Route::delete('{id}', [UserFormController::class, 'destroy'])->name('destroy');
});
