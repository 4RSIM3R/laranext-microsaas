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

    public function destroy($id)
    {
        $this->service->destroy($id);
        return redirect()->route('user.form.index')->with('success', 'Form deleted successfully');
    }
}
