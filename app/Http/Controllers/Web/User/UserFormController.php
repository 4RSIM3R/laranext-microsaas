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
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, ['user.form.index']);
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
