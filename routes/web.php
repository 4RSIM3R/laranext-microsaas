<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\FormViewerController;
use App\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('', [HomeController::class, 'index'])->name('home');

// Public form routes
Route::get('forms/{slug}', [FormViewerController::class, 'show'])->name('forms.public.show');
Route::get('preview/form/{id}', [FormViewerController::class, 'preview'])->name('forms.preview');

// Form submission routes
Route::post('submissions', [SubmissionController::class, 'submit'])->name('submissions.submit');
Route::get('forms/{formId}/submissions', [SubmissionController::class, 'getByForm'])->name('submissions.by-form');
Route::get('forms/{formId}/stats', [SubmissionController::class, 'getStats'])->name('submissions.stats');

