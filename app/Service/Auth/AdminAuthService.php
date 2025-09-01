<?php

namespace App\Service\Auth;

use App\Models\Admin;
use App\Models\AdminPasswordResetToken;
use App\Service\AuthService;
use Illuminate\Database\Eloquent\Model;

class AdminAuthService extends AuthService
{

    protected string $username = 'email';
    protected string|null $guard = 'admin';
    protected string|null $guardForeignKey = null;
    protected string|null $broker = 'admins';
    protected bool $withToken = false;
    protected bool $requestVerifyEmail = true;
    protected Model $model;
    /**
     * Override the reset token model to the Admin-specific table/model.
     */
    protected string $passwordResetTokenModel = AdminPasswordResetToken::class;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(Admin $model)
    {
        $this->model = $model;
    }
}
