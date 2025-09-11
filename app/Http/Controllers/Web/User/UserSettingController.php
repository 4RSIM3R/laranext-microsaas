<?php

namespace App\Http\Controllers\Web\User;

use App\Contract\Setting\AppSettingContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserSettingController extends Controller
{

    protected AppSettingContract $service;

    public function __construct(AppSettingContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('user/setting/index');
    }

    public function fetch() {}

    public function show($id)
    {
        $setting = $this->service->find($id);
        return Inertia::render('user/setting/form', [
            'setting' => $setting
        ]);
    }

    public function create()
    {
        return Inertia::render('user/setting/form');
    }

    public function store(SettingRequest $request)
    {
        $payload = $request->validated();
        $payload['user_id'] = Auth::guard('user')->id();
        $setting = $this->service->create($payload);
        return Inertia::render('user/setting/form', [
            'setting' => $setting
        ]);
    }

    public function update(SettingRequest $request, $id)
    {
        $payload = $request->validated();
        $payload['user_id'] = Auth::guard('user')->id();
        $setting = $this->service->update($id, $payload);
        return Inertia::render('user/setting/form', [
            'setting' => $setting
        ]);
    }

    public function destroy($id)
    {
        $this->service->destroy($id);
        return redirect()->route('user.setting.index')->with('success', 'Setting deleted successfully');
    }
}
