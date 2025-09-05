<?php

namespace App\Http\Controllers\Web\Admin;

use App\Contract\Setting\SystemSettingContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use App\Utils\WebResponse;
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

    public function store(SettingRequest $request)
    {
        $result = $this->service->create($request->validated());
        return WebResponse::response($result);
    }
}
