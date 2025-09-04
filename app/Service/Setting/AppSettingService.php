<?php 

namespace App\Service\Setting;

use App\Contract\Setting\AppSettingContract;
use App\Models\AppSetting;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class AppSettingService extends BaseService implements AppSettingContract
{

    protected Model $model;

    public function __construct(AppSetting $model)
    {
        $this->model = $model;
    }

}