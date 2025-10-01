<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Contract\Form\FormContract;
use App\Http\Requests\StoreFormRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class UserFormController extends Controller
{

    protected FormContract $service;

    public function __construct(FormContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('user/form/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: [],
            sorts: [],
            paginate: true,
            per_page: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('user/form/form');
    }

    public function store(StoreFormRequest $request)
    {
        $validated = $request->validated();
        $pages = $validated['pages'] ?? [];
        unset($validated['pages']);

        $data = $this->service->createWithPages($validated, $pages);
        return WebResponse::response($data, 'user.form.index');
    }

    public function show($id)
    {
        $form = $this->service->find($id);
        return Inertia::render('user/form/form', [
            'form' => $form
        ]);
    }

    public function detail($id)
    {
        $form = $this->service->find($id);
        if (!$form) {
            abort(404);
        }

        $analytics = $form->getAnalytics();

        return Inertia::render('user/form/detail', [
            'form' => $form,
            'analytics' => $analytics
        ]);
    }

    public function builder($id)
    {
        $form = $this->service->find($id);
        return Inertia::render('user/form/builder', [
            'form' => $form
        ]);
    }

    public function update(StoreFormRequest $request, $id)
    {
        $validated = $request->validated();
        $pages = $validated['pages'] ?? [];
        unset($validated['pages']);

        $data = $this->service->updateWithPages($id, $validated, $pages);
        return WebResponse::response($data);
    }

    public function generateEmbed($id)
    {
        $form = $this->service->generateEmbedCode($id);
        return response()->json([
            'success' => true,
            'data' => $form,
            'embed_url' => route('forms.embed', $form->embed_code),
            'embed_code' => '<iframe src="' . route('forms.embed', $form->embed_code) . '" width="100%" height="600" frameborder="0"></iframe>'
        ]);
    }

    public function generateCustomEmbed($id)
    {
        $form = $this->service->generateEmbedCode($id);

        $cssTemplate = <<<CSS
/* Form Container */
#form-container { max-width: 42rem; margin: 0 auto; }
.form-card { background: #ffffff; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }

/* Form Header */
.form-header { margin-bottom: 1.5rem; }
.form-header-content { display: flex; flex-direction: column; gap: 0.5rem; }
.form-page-title { font-size: 1.5rem; font-weight: 600; color: #1f2937; }
.form-page-description { color: #6b7280; }
.form-progress-badge { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.875rem; }

/* Progress Bar */
.form-progress-container { margin-top: 1rem; }
.form-progress-bar { height: 0.5rem; background: #3b82f6; border-radius: 9999px; transition: width 0.3s; }
.form-progress-text { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }

/* Form Groups */
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
.form-required { color: #ef4444; margin-left: 0.25rem; }

/* Input Fields */
.form-input, .form-textarea, .form-select { 
    width: 100%; 
    padding: 0.5rem 0.75rem; 
    border: 1px solid #d1d5db; 
    border-radius: 0.375rem; 
    font-size: 1rem;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.form-input[aria-invalid="true"], .form-textarea[aria-invalid="true"], .form-select[aria-invalid="true"] {
    border-color: #ef4444;
}

/* Radio and Checkbox */
.form-radio-group, .form-checkbox-group { display: flex; flex-direction: column; gap: 0.75rem; }
.form-radio-item, .form-checkbox-item { display: flex; align-items: center; gap: 0.5rem; }
.form-radio-input, .form-checkbox-input { width: 1rem; height: 1rem; cursor: pointer; }
.form-radio-label, .form-checkbox-label { cursor: pointer; }

/* Password Field */
.form-password-wrapper { position: relative; }
.form-password-input { padding-right: 2.5rem; }
.form-password-toggle { 
    position: absolute; 
    right: 0.75rem; 
    top: 50%; 
    transform: translateY(-50%); 
    background: none; 
    border: none; 
    cursor: pointer; 
    color: #9ca3af;
}

/* Help Text and Errors */
.form-help { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
.form-char-count { text-align: right; font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
.form-error { display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: #ef4444; margin-top: 0.25rem; }
.form-error-icon { width: 1rem; height: 1rem; }
.form-general-error { 
    padding: 1rem; 
    background: #fef2f2; 
    border: 1px solid #fee2e2; 
    border-radius: 0.375rem; 
    display: flex; 
    align-items: center; 
    gap: 0.5rem; 
    color: #dc2626; 
}

/* Form Footer */
.form-footer { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-top: 1.5rem; 
    padding-top: 1.5rem; 
    border-top: 1px solid #e5e7eb;
}

/* Buttons */
.form-btn { 
    padding: 0.5rem 1rem; 
    border-radius: 0.375rem; 
    font-weight: 500; 
    cursor: pointer; 
    transition: opacity 0.15s;
    border: none;
}
.form-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.form-btn-primary { background: #3b82f6; color: #ffffff; }
.form-btn-primary:hover:not(:disabled) { opacity: 0.9; }
.form-btn-secondary { background: #ffffff; color: #374151; border: 1px solid #d1d5db; }
.form-btn-secondary:hover:not(:disabled) { background: #f9fafb; }
.form-spinner { 
    display: inline-block; 
    width: 1rem; 
    height: 1rem; 
    margin-right: 0.5rem; 
    border: 2px solid #ffffff; 
    border-top-color: transparent; 
    border-radius: 50%; 
    animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Success State */
.form-success { text-align: center; padding: 2rem; }
.form-success-icon { 
    width: 4rem; 
    height: 4rem; 
    margin: 0 auto 1rem; 
    background: #d1fae5; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center;
}
.form-icon-check { width: 2rem; height: 2rem; color: #059669; }
.form-success-title { font-size: 1.875rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem; }
.form-success-message { color: #6b7280; }

/* Icons */
.form-icon { width: 1rem; height: 1rem; }
CSS;

        $embedUrl = route('forms.custom-embed', $form->embed_code);
        $embedCodeWithCss = <<<HTML
<!-- Option 1: Embed without custom CSS (unstyled) -->
<iframe src="{$embedUrl}" width="100%" height="600" frameborder="0"></iframe>

<!-- Option 2: Embed with your custom CSS file -->
<iframe src="{$embedUrl}?css=https://your-site.com/form-styles.css" width="100%" height="600" frameborder="0"></iframe>
HTML;

        return response()->json([
            'success' => true,
            'data' => $form,
            'embed_url' => $embedUrl,
            'embed_code' => $embedCodeWithCss,
            'css_template' => $cssTemplate
        ]);
    }

    public function submissions($id)
    {
        $form = $this->service->find($id);
        if (!$form) {
            abort(404);
        }

        // Get all form fields to create dynamic columns
        $allFields = collect();
        foreach ($form->pages as $page) {
            $allFields = $allFields->merge($page->fields);
        }

        // Get submissions with pagination
        $page = request()->get('page', 1);
        $perPage = request()->get('perPage', 10);
        $search = request()->get('search');
        $sort = request()->get('sort');

        $query = $form->submissions()->with('form');

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('data', 'like', '%' . $search . '%')
                    ->orWhere('ip_address', 'like', '%' . $search . '%')
                    ->orWhere('user_agent', 'like', '%' . $search . '%');
            });
        }

        // Apply sorting
        if ($sort) {
            $sortField = ltrim($sort, '-');
            $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';

            if (in_array($sortField, ['id', 'submitted_at', 'ip_address', 'status'])) {
                $query->orderBy($sortField, $sortDirection);
            } else {
                // For data fields, we need to sort by JSON data
                $query->orderByRaw("JSON_EXTRACT(data, '$.{$sortField}') {$sortDirection}");
            }
        } else {
            $query->orderBy('submitted_at', 'desc');
        }

        $submissions = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform submissions to include all possible fields
        $transformedSubmissions = $submissions->getCollection()->map(function ($submission) use ($allFields) {
            $data = $submission->data ?? [];
            $transformedData = [
                'id' => $submission->id,
                'submitted_at' => $submission->submitted_at?->format('Y-m-d H:i:s'),
                'ip_address' => $submission->ip_address,
                'status' => $submission->status ?? 'completed',
            ];

            // Add all form fields, even if not filled
            foreach ($allFields as $field) {
                $transformedData[$field->name] = $data[$field->name] ?? null;
            }

            return $transformedData;
        });

        // Create column definitions
        $columns = [
            [
                'key' => 'id',
                'label' => 'ID',
                'type' => 'number',
                'sortable' => true
            ],
            [
                'key' => 'submitted_at',
                'label' => 'Submitted At',
                'type' => 'datetime',
                'sortable' => true
            ]
        ];

        // Add dynamic columns for form fields
        foreach ($allFields as $field) {
            $columns[] = [
                'key' => $field->name,
                'label' => $field->label,
                'type' => $field->type,
                'sortable' => true,
                'field_id' => $field->id
            ];
        }

        $columns = array_merge($columns, [
            [
                'key' => 'ip_address',
                'label' => 'IP Address',
                'type' => 'text',
                'sortable' => true
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'type' => 'text',
                'sortable' => true
            ]
        ]);

        return response()->json([
            'items' => $transformedSubmissions,
            'columns' => $columns,
            'current_page' => $submissions->currentPage(),
            'last_page' => $submissions->lastPage(),
            'per_page' => $submissions->perPage(),
            'total' => $submissions->total(),
            'total_page' => $submissions->lastPage(),
        ]);
    }

    public function destroy($id)
    {
        $this->service->destroy($id);
        return redirect()->route('user.form.index')->with('success', 'Form deleted successfully');
    }
}
