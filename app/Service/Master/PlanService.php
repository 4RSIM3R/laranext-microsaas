<?php

namespace App\Service\Master;

use App\Contract\Master\PlanContract;
use App\Models\Plan;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class PlanService extends BaseService implements PlanContract
{

    protected Model $model;

    public function __construct(Plan $model)
    {
        $this->model = $model;
    }
}
