<?php

namespace App\Http\Controllers\Web\Admin;

use App\Contract\Master\PlanContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PlanRequest;
use Inertia\Inertia;

class AdminPlanController extends Controller
{
    private PlanContract $service;

    public function __construct(PlanContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('admin/plan/index');
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

    public function show($id)
    {
        $plan = $this->service->find($id);
        return Inertia::render('admin/plan/form', [
            'plan' => $plan
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/plan/form');
    }

    public function store(PlanRequest $request)
    {
        $plan = $this->service->create($request->validated());

        return redirect()->route('admin.plan.index')->with('success', 'Plan created successfully');
    }

    public function update(PlanRequest $request, $id)
    {
        $plan = $this->service->update(['id' => $id], $request->validated());

        return redirect()->route('admin.plan.index')->with('success', 'Plan updated successfully');
    }

    public function destroy($id)
    {
        $this->service->destroy($id);
        return redirect()->route('admin.plan.index')->with('success', 'Plan deleted successfully');
    }
}
