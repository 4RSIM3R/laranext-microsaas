<?php

namespace App\Contract\Form;

use App\Contract\BaseContract;

interface FieldContract extends BaseContract
{
    public function getFieldsByPage(int $pageId);
    public function getFieldsByForm(int $formId);
    public function reorderFields(int $pageId, array $fieldOrders);
}