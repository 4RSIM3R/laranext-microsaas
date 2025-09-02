<?php

namespace App\Http\Controllers\Web\User;

use App\Contract\Auth\UserAuthContract;
use App\Contract\AuthContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;

class UserAuthController extends Controller
{
    private UserAuthContract $service;

    public function __construct(UserAuthContract $service)
    {
        $this->service = $service;
    }

    public function login() {}

    public function authenticate(LoginRequest $request) {}

    public function register() {}

    public function store(RegisterRequest $request) {}

    public function logout() {}
}
