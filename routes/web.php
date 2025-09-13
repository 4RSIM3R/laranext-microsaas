<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\FormViewerController;
use Illuminate\Support\Facades\Route;

Route::get('', [HomeController::class, 'index'])->name('home');

// Public form routes
Route::get('forms/{slug}', [FormViewerController::class, 'show'])->name('forms.public.show');
Route::get('preview/form/{id}', [FormViewerController::class, 'preview'])->name('forms.preview');

