<?php

namespace App\Service\Master;

use App\Contract\Master\FeatureContract;
use App\Models\Feature;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class FeatureService extends BaseService implements FeatureContract
{
    protected Model $model;

    public function __construct(Feature $model)
    {
        $this->model = $model;
    }
}
