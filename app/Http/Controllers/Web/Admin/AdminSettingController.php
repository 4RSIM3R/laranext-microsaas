<?php

namespace App\Http\Controllers\Web\Admin;

use App\Contract\Setting\SystemSettingContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use Inertia\Inertia;

class AdminSettingController extends Controller
{
    private SystemSettingContract $service;

    public function __construct(SystemSettingContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('admin/setting/index');
    }

    public function fetch() {}

    public function show($id)
    {
        $setting = $this->service->find($id);
        return Inertia::render('admin/setting/form', [
            'setting' => $setting
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/setting/form');
    }

    public function store(SettingRequest $request)
    {
        $setting = $this->service->create($request->validated());
        return Inertia::render('admin/setting/form', [
            'setting' => $setting
        ]);
    }

    public function update(SettingRequest $request, $id)
    {
        $setting = $this->service->update($id, $request->validated());
        return Inertia::render('admin/setting/form', [
            'setting' => $setting
        ]);
    }

    public function destroy($id)
    {
        $this->service->destroy($id);
        return redirect()->route('admin.setting.index')->with('success', 'Setting deleted successfully');
    }
}
