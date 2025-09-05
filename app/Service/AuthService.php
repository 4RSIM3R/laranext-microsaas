<?php

namespace App\Service;

use App\Contract\AuthContract;
use App\Mail\OTPMail;
use App\Mail\EmailVerificationMail;
use App\Models\PasswordResetToken;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService implements AuthContract
{
    protected string $username = 'email';
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected string|null $broker = 'users';
    protected Model $model;
    /**
     * The Eloquent model class used to store and validate password/OTP reset tokens.
     * Can be overridden by child services (e.g., Admin service) to use a different model.
     */
    protected string $passwordResetTokenModel = PasswordResetToken::class;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Model
     */
    public function build(): Model
    {
        return $this->model;
    }

    /**
     * Get user id by guard name.
     *
     * @return int
     */
    public function userID(): int
    {
        return Auth::guard($this->guard)->id();
    }

    /**
     * Login to app.
     *
     * @param array $credentials
     */
    public function login(array $credentials)
    {
        try {
            $userQuery = $this->model::query()->where($this->username, $credentials[$this->username]);
            $user = $userQuery->first();

            if (!$userQuery->exists()) {
                return new Exception($this->username . ' not registered.');
            }

            if (!Hash::check($credentials["password"], $user->password)) {
                return new Exception('Password incorrect.');
            }

            if (!$user->email_verified_at) {
                return new Exception('Email not verified.');
            }

            if (!$login = Auth::guard($this->guard)->attempt($credentials)) {
                return new Exception($this->username . ' or password incorrect.');
            }

            return $login;
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * Register new user.
     *
     * @param array $payloads
     * @return Exception
     */
    public function register(array $payloads, $assignRole = [])
    {
        try {
            DB::beginTransaction();

            $user = $this->model->create($payloads);

            if ($assignRole) {
                $user->assignRole($assignRole);
            }

            DB::commit();

            return $user;
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Update user role and profile.
     *
     * @param array $payloads
     * @return Exception
     */
    public function update($id, array $payloads, $assignRole = [])
    {
        try {
            DB::beginTransaction();

            $user = $this->model->find($id);
            $user->update($payloads);
            if ($assignRole) {
                $user->syncRoles($assignRole);
            }


            DB::commit();

            return $user->first();
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Logout user from app.
     *
     * @return Exception|true
     */
    public function logout(): Exception|bool
    {
        try {
            Auth::guard($this->guard)->logout();
            return true;
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * Send OTP code for validate email.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function send_otp(array $payloads)
    {
        try {
            $randomNumber = rand(0, 999999);
            $otp = str_pad($randomNumber, 6, '0', STR_PAD_LEFT);

            $user = $this->model::query()
                ->where('email', $payloads['email'])
                ->first();

            if (!$user)
                return new Exception('Email not registered.');

            DB::beginTransaction();

            ($this->passwordResetTokenModel)::updateOrCreate(
                ['email' => $payloads['email']],
                [
                    'otp' => Hash::make($otp),
                    'otp_expired' => Carbon::now()->addMinutes(config('service-contract.auth.otp_expired'))
                ]
            );

            DB::commit();

            Mail::to($payloads['email'])->queue(new OTPMail($otp));

            return [
                'email' => $payloads['email']
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Send OTP code for validate email.
     *
     * @param array $payloads
     * @return array|Exception
     */
    public function validate_otp(array $payloads)
    {
        try {
            $token = Str::random(64);

            DB::beginTransaction();

            $reset = ($this->passwordResetTokenModel)::query()
                ->where('email', $payloads['email'])
                ->first();

            if (!Hash::check($payloads['otp'], $reset->otp)) {
                return new Exception('OTP is incorrect.');
            }

            $reset->update([
                // 'otp' => null,
                'token' => Hash::make($token),
                'token_expired' => Carbon::now()->addMinutes(config('service-contract.auth.token_expired'))
            ]);

            DB::commit();

            return [
                'email' => $payloads['email'],
                'token' => $token
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Validate OTP for resert password.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function reset_password(array $payloads)
    {
        try {
            DB::beginTransaction();

            $reset = ($this->passwordResetTokenModel)::query()
                ->where('email', $payloads['email'])
                ->first();

            if (!Hash::check($payloads['token'], $reset->token)) {
                return new Exception('Token is incorrect.');
            }

            $this->model::where('email', $payloads['email'])
                ->update(['password' => Hash::make($payloads['password'])]);

            $reset->delete();

            DB::commit();

            return true;
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Send reset link to email for resert password.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function send_reset_link(array $payloads)
    {
        try {
            $status = Password::broker($this->broker)->sendResetLink([
                'email' => $payloads['email']
            ]);

            return $status === Password::RESET_LINK_SENT;
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * Send email verification link to user.
     *
     * @param array $payloads
     * @return array|Exception
     */
    public function send_email_verification(array $payloads)
    {
        try {
            $user = $this->model::query()
                ->where('email', $payloads['email'])
                ->first();

            if (!$user) {
                return new Exception('User not registered.');
            }

            if ($user->email_verified_at) {
                return new Exception('Email already verified. Please login.');
            }

            $verificationToken = Str::random(64);
            $verificationUrl = url("/user/verify-email?token={$verificationToken}&email=" . urlencode($payloads['email']));

            DB::beginTransaction();

            ($this->passwordResetTokenModel)::updateOrCreate(
                ['email' => $payloads['email']],
                [
                    'token' => Hash::make($verificationToken),
                    'token_expired' => Carbon::now()->addHours(24) // 24 hours expiry
                ]
            );

            DB::commit();

            Mail::to($payloads['email'])->queue(new EmailVerificationMail($verificationUrl, $user->name ?? ''));

            return [
                'email' => $payloads['email'],
                'message' => 'Verification email sent successfully.'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Verify user email with token.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function verify_email(array $payloads)
    {
        try {
            DB::beginTransaction();

            $reset = ($this->passwordResetTokenModel)::query()
                ->where('email', $payloads['email'])
                ->first();

            if (!$reset || !$reset->token) {
                return new Exception('Verification token is incorrect.');
            }

            if (!Hash::check($payloads['token'], $reset->token)) {
                return new Exception('Verification token is incorrect.');
            }

            if ($reset->token_expired && Carbon::now()->isAfter($reset->token_expired)) {
                return new Exception('Verification token has expired. Please request a new verification token.');
            }

            // Update user email verification status
            $this->model::where('email', $payloads['email'])
                ->update(['email_verified_at' => Carbon::now()]);

            // Remove the verification token
            $reset->delete();

            DB::commit();

            return true;
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }
}
