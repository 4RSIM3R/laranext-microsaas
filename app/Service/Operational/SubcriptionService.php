<?php 

namespace App\Service\Operational;

use App\Contract\Operational\SubcriptionContract;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Laravel\Cashier\Subscription;

class SubcriptionService extends BaseService implements SubcriptionContract
{

    protected Model $model;

    public function __construct(Subscription $model)
    {
        $this->model = $model;
    }

}