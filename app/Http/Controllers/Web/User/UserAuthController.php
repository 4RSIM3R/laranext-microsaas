<?php

namespace App\Http\Controllers\Web\User;

use App\Contract\Auth\UserAuthContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserAuthController extends Controller
{
    private UserAuthContract $service;

    public function __construct(UserAuthContract $service)
    {
        $this->service = $service;
    }

    public function login()
    {
        return Inertia::render('user/auth/login');
    }

    public function authenticate(LoginRequest $request)
    {
        $payload = $request->validated();
        $result = $this->service->login($payload);
        return WebResponse::response($result, "user.dashboard.index");
    }

    public function register()
    {
        return Inertia::render('user/auth/register');
    }

    public function store(RegisterRequest $request)
    {
        $payload = $request->validated();
        unset($payload['password_confirmation']);
        $payload['password'] = Hash::make($payload['password']);
        $result = $this->service->register($payload);
        return WebResponse::response($result, "user.auth.login");
    }

    public function logout()
    {
        $result = $this->service->logout();
        return WebResponse::response($result, "home");
    }

    public function forgot()
    {
        return Inertia::render('user/auth/forgot-password');
    }

    public function send_email(ForgotPasswordRequest $request)
    {
        $payload = $request->validated();
    }

    public function change()
    {
        return Inertia::render('user/auth/change-password');
    }

    public function reset(ChangePasswordRequest $request)
    {
        $payload = $request->validated();
    }
}
