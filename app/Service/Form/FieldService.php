<?php

namespace App\Service\Form;

use App\Contract\Form\FieldContract;
use App\Models\Field;
use App\Service\BaseService;

class FieldService extends BaseService implements FieldContract
{
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected array $relation = ['page'];

    public function __construct(Field $model)
    {
        $this->model = $model;
    }

    public function getFieldsByPage(int $pageId)
    {
        return $this->model->where('page_id', $pageId)
            ->with($this->relation)
            ->orderBy('sort_order')
            ->get();
    }

    public function getFieldsByForm(int $formId)
    {
        return $this->model->whereHas('page', function ($query) use ($formId) {
            $query->where('form_id', $formId);
        })
        ->with(['page.form'])
        ->orderBy('page_id')
        ->orderBy('sort_order')
        ->get();
    }

    public function reorderFields(int $pageId, array $fieldOrders)
    {
        foreach ($fieldOrders as $order) {
            $this->model->where('id', $order['id'])->update([
                'sort_order' => $order['sort_order']
            ]);
        }

        return $this->getFieldsByPage($pageId);
    }
}