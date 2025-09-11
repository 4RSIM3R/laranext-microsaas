<?php

namespace App\Service\Master;

use App\Contract\Master\PlanContract;
use App\Models\Plan;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PlanService extends BaseService implements PlanContract
{

    protected Model $model;

    public function __construct(Plan $model)
    {
        $this->model = $model;
    }

    public function create($payloads)
    {
        return DB::transaction(function () use ($payloads) {
            $features = $payloads['features'] ?? [];
            unset($payloads['features']);

            $plan = parent::create($payloads);

            if (!empty($features)) {
                $this->syncFeatures($plan, $features);
            }

            return $plan->load('features');
        });
    }

    public function update(array $conditions = [], $payloads)
    {
        return DB::transaction(function () use ($conditions, $payloads) {
            $features = $payloads['features'] ?? [];
            unset($payloads['features']);

            // Update the plan using parent method
            parent::update($conditions, $payloads);

            // Find the updated plan
            $plan = $this->model->where($conditions)->firstOrFail();

            $this->syncFeatures($plan, $features);

            return $plan->load('features');
        });
    }

    public function find($id, array $relation = [])
    {
        $defaultRelations = array_merge(['features'], $relation);
        return parent::find($id, $defaultRelations);
    }

    private function syncFeatures(Plan $plan, array $features)
    {
        // Delete existing features
        $plan->features()->delete();

        // Create new features
        foreach ($features as $featureData) {
            $plan->features()->create($featureData);
        }
    }
}
