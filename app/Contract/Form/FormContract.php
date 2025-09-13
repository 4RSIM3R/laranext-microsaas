<?php

namespace App\Contract\Form;

use App\Contract\BaseContract;

interface FormContract extends BaseContract
{
    public function findBySlug(string $slug);
    public function createWithPages(array $data, array $pages = []);
    public function updateWithPages(int $id, array $data, array $pages = []);
    public function duplicate(int $id);
    public function getFormsByUser(int $userId);
    public function toggleActive(int $id);
}