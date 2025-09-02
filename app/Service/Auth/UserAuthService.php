<?php

namespace App\Service\Auth;

use App\Models\User;
use App\Contract\Auth\UserAuthContract;
use App\Service\AuthService;
use Illuminate\Database\Eloquent\Model;

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
}
