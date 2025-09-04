<?php

namespace App\Providers;

use App\Contract\AuthContract;
use App\Contract\BaseContract;
use App\Contract\Master\AddonContract;
use App\Contract\Master\FeatureContract;
use App\Contract\Master\PlanContract;
use App\Contract\Master\UserContract;
use App\Contract\Setting\AppSettingContract;
use App\Contract\Setting\SystemSettingContract;
use App\Service\BaseService;
use App\Service\AuthService;
use App\Service\Master\AddonService;
use App\Service\Master\FeatureService;
use App\Service\Master\PlanService;
use App\Service\Master\UserService;
use App\Service\Setting\AppSettingService;
use App\Service\Setting\SystemSettingService;
use Illuminate\Support\ServiceProvider;

class ContractProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        
        $this->app->bind(BaseContract::class, BaseService::class);
        $this->app->bind(AuthContract::class, AuthService::class);

        /**
         * Master Service Contract.
         */
        $this->app->bind(FeatureContract::class, FeatureService::class);
        $this->app->bind(PlanContract::class, PlanService::class);
        $this->app->bind(UserContract::class, UserService::class);


        /**
         * Setting Service Contract.
         */
        $this->app->bind(AppSettingContract::class, AppSettingService::class);
        $this->app->bind(SystemSettingContract::class, SystemSettingService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
