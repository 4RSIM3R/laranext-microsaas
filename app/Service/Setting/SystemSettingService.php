<?php 

namespace App\Service\Setting;

use App\Contract\Setting\SystemSettingContract;
use App\Models\SystemSetting;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class SystemSettingService extends BaseService implements SystemSettingContract
{

    protected Model $model;

    public function __construct(SystemSetting $model)
    {
        $this->model = $model;
    }

}