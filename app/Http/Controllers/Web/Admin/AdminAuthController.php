<?php 

namespace App\Http\Controllers\Web\Admin;

use App\Contract\Auth\AdminAuthContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class AdminAuthController extends Controller {
    
    private AdminAuthContract $service;

    public function __construct(AdminAuthContract $service)
    {
        $this->service = $service;
    }

    public function login()
    {
        return Inertia::render('admin/auth/login');
    }

    public function authenticate(LoginRequest $request)
    {
        $payload = $request->validated();
        $result = $this->service->login($payload);
        return WebResponse::response($result, "admin.dashboard.index");
    }

    public function logout()
    {
        $result = $this->service->logout();
        return WebResponse::response($result, "home");
    }

}