<?php

namespace App\Http\Controllers;

use App\Contract\Form\FormContract;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormViewerController extends Controller
{
    private FormContract $formService;

    public function __construct(FormContract $formService)
    {
        $this->formService = $formService;
    }

    public function show($slug)
    {
        $form = $this->formService->findBySlug($slug);

        if (!$form) {
            abort(404);
        }

        if (!$form->is_active) {
            abort(404);
        }

        return Inertia::render('public/FormViewer', [
            'form' => $form
        ]);
    }

    public function preview($id)
    {
        $form = $this->formService->find($id);

        if (!$form) {
            abort(404);
        }

        return Inertia::render('public/FormViewer', [
            'form' => $form,
            'isPreview' => true
        ]);
    }
}