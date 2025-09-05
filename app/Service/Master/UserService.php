<?php

namespace App\Service\Master;

use App\Contract\Master\UserContract;
use App\Models\User;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class UserService extends BaseService implements UserContract
{
    protected Model $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }
}
