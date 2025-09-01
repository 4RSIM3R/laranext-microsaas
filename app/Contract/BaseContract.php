<?php

namespace App\Contract;

interface BaseContract
{
    public function all(
        $filters = [],
        $sorts = [],
        bool|null $paginate = null,
        array $relation = [],
        array $with_count = [],
        int $per_page = 10,
        string $order_column = 'id',
        string $order_position = 'asc',
        array $conditions = [],
    );
    public function find($id, array $relation = []);
    public function create($payloads);
    public function insert($payloads);
    public function update(array $conditions = [], $payloads);
    public function destroy($id);
    public function bulk_delete(array $ids);
    public function update_or_create(array $conditions = [], $payloads);
}