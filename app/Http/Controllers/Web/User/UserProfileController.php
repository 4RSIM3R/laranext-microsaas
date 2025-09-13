<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use App\Utils\WebResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function index()
    {
        $user = Auth::guard('user')->user();
        return Inertia::render('user/profile/index', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
            ]);

            if ($validator->fails()) {
                return WebResponse::error($validator->errors()->first());
            }

            $user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            return WebResponse::response($user);
        } catch (Exception $e) {
            return WebResponse::error($e->getMessage());
        }
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        try {
            $user = Auth::guard('user')->user();
            $payload = $request->validated();


            if (!Hash::check($payload['current_password'], $user->password)) {
                return WebResponse::error('Current password is incorrect');
            }

            $user->update([
                'password' => Hash::make($payload['password']),
            ]);

            return WebResponse::response($user);
        } catch (Exception $e) {
            return back()->withErrors('errors', $e->getMessage());
        }
    }
}
