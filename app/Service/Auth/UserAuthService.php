<?php

namespace App\Service\Auth;

use App\Models\User;
use App\Contract\Auth\UserAuthContract;
use App\Service\AuthService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Exception;

class UserAuthService extends AuthService implements UserAuthContract
{

    protected string $username = 'email';
    protected string|null $guard = 'user';
    protected string|null $guardForeignKey = null;
    protected string|null $broker = 'users';
    protected bool $withToken = false;
    protected bool $requestVerifyEmail = true;
    protected Model $model;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(User $model)
    {
        $this->model = $model;
    }

    /**
     * Register new user and send email verification.
     *
     * @param array $payloads
     * @param array $assignRole
     * @return Exception|Model
     */
    public function register(array $payloads, $assignRole = [])
    {
        try {
            // Call parent register method
            $result = parent::register($payloads, $assignRole);

            if ($result instanceof Exception) {
                return $result;
            }

            // Send email verification if enabled
            if ($this->requestVerifyEmail) {
                $verificationResult = $this->send_email_verification(['email' => $payloads['email']]);

                if ($verificationResult instanceof Exception) {
                    // Log the error but don't fail registration
                    Log::warning('Failed to send email verification: ' . $verificationResult->getMessage());
                }
            }

            return $result;
        } catch (Exception $exception) {
            return $exception;
        }
    }
}
