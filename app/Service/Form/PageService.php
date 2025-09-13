<?php

namespace App\Service\Form;

use App\Contract\Form\PageContract;
use App\Models\Page;
use App\Models\Field;
use App\Service\BaseService;
use Exception;

class PageService extends BaseService implements PageContract
{
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected array $relation = ['form', 'fields'];

    public function __construct(Page $model)
    {
        $this->model = $model;
    }

    public function getPagesByForm(int $formId)
    {
        return $this->model->where('form_id', $formId)
            ->with($this->relation)
            ->orderBy('sort_order')
            ->get();
    }

    public function createWithFields(array $data, array $fields = [])
    {
        $page = $this->create($data);

        if (!empty($fields)) {
            foreach ($fields as $index => $fieldData) {
                $fieldData['page_id'] = $page->id;
                $fieldData['sort_order'] = $index + 1;
                Field::create($fieldData);
            }
        }

        return $page->fresh($this->relation);
    }

    public function updateWithFields(int $id, array $data, array $fields = [])
    {
        $page = $this->update($id, $data);

        if (!empty($fields)) {
            // Delete existing fields
            $page->fields()->delete();

            // Create new fields
            foreach ($fields as $index => $fieldData) {
                $fieldData['page_id'] = $page->id;
                $fieldData['sort_order'] = $index + 1;
                Field::create($fieldData);
            }
        }

        return $page->fresh($this->relation);
    }

    public function reorderPages(int $formId, array $pageOrders)
    {
        foreach ($pageOrders as $order) {
            $this->model->where('id', $order['id'])->update([
                'sort_order' => $order['sort_order']
            ]);
        }

        return $this->getPagesByForm($formId);
    }
}