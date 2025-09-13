<?php

namespace App\Contract\Form;

use App\Contract\BaseContract;

interface PageContract extends BaseContract
{
    public function getPagesByForm(int $formId);
    public function createWithFields(array $data, array $fields = []);
    public function updateWithFields(int $id, array $data, array $fields = []);
    public function reorderPages(int $formId, array $pageOrders);
}