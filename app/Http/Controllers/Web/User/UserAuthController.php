<?php

namespace App\Http\Controllers\Web\User;

use App\Contract\Auth\UserAuthContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Plan;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        if ($result instanceof \Exception) {
            return WebResponse::response($result, "user.auth.login");
        }

        $user = Auth::guard('user')->user();

        // Check if user has an active subscription
        if ($user && $user->subscribed('default')) {
            return WebResponse::response($result, "user.dashboard.index");
        }

        return WebResponse::response($result, "user.dashboard.onboarding");
    }

    public function register()
    {
        $plan = Plan::query()->where('is_active', true)->get();
        return Inertia::render('user/auth/register', [
            'plans' => $plan
        ]);
    }

    public function store(RegisterRequest $request)
    {
        $payload = $request->validated();
        unset($payload['password_confirmation']);
        $payload['password'] = Hash::make($payload['password']);
        $result = $this->service->register($payload);

        if ($result instanceof \Exception) {
            return WebResponse::response($result, "user.auth.register");
        }

        // Auto-login the user after successful registration
        $credentials = $request->only('email', 'password');
        if (Auth::guard('user')->attempt($credentials)) {
            $request->session()->regenerate();

            return WebResponse::response(
                $result,
                "user.dashboard.onboarding"
            );
        }

        // Fallback to login page if auto-login fails
        return WebResponse::response(
            $result,
            "user.auth.login"
        );
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
        // TODO: Implement forgot password email sending
    }

    public function change()
    {
        return Inertia::render('user/auth/change-password');
    }

    public function reset(ChangePasswordRequest $request)
    {
        $payload = $request->validated();
        // TODO: Implement password reset
    }

    /**
     * Handle email verification from email link
     */
    public function verify_email(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email'
        ]);

        $payload = $request->only(['token', 'email']);
        $result = $this->service->verify_email($payload);

        if ($result instanceof \Exception) {
            return redirect()->route('user.auth.login')->with('error', $result->getMessage());
        }

        return redirect()->route('user.auth.login')->with('success', 'Email verified successfully! You can now login.');
    }

    /**
     * Show resend verification page
     */
    public function resend_verification_page()
    {
        return Inertia::render('user/auth/verify-email');
    }

    /**
     * Resend email verification
     */
    public function resend_verification(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $payload = $request->only(['email']);
        $result = $this->service->send_email_verification($payload);

        if ($result instanceof \Exception) {
            return WebResponse::response($result, "user.auth.verify-email");
        }

        return WebResponse::response([
            'message' => 'Verification email sent successfully!'
        ], "user.auth.verify-email");
    }
}
