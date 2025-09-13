<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
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
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
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

            return WebResponse::success('Profile updated successfully', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return WebResponse::error($e->getMessage());
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return WebResponse::error($validator->errors()->first());
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return WebResponse::error('Current password is incorrect');
            }

            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return WebResponse::success('Password updated successfully');

        } catch (\Exception $e) {
            return WebResponse::error($e->getMessage());
        }
    }
}