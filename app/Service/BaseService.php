<?php

namespace App\Service;

use App\Contract\BaseContract;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class BaseService implements BaseContract
{
    protected array $relation = [];
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected array $fileKeys = [];
    protected Model $model;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Model
     */
    public function build(): Model
    {
        return $this->model;
    }

    /**
     * Get user id by guard name.
     *
     * @return int
     */
    public function userID(): int
    {
        return Auth::guard($this->guard)->id();
    }

    /**
     * Get all items from resource.
     *
     * @param array $filters
     * @param array $sorts
     * @param bool|null $paginate
     * @param array $relation
     * @param array $with_count
     * @param int $per_page
     * @param string $order_column
     * @param string $order_position
     * @param array $conditions
     * @return array|Exception|LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection|\Illuminate\Support\HigherOrderWhenProxy[]|QueryBuilder[]
     */
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
    ) {
        try {
            $model = QueryBuilder::for($this->model::class);

            $model->allowedFilters($filters)
                ->allowedSorts($sorts)
                ->with($relation)
                ->where($conditions)
                ->when(!empty($with_count), function ($query) use ($with_count) {
                    $query->withCount($with_count);
                })
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->orderBy($order_column, $order_position);

            if (!$paginate) return $model->get();

            $result = $model->paginate($per_page)
                ->appends(request()->query());

            return [
                'items' => $result->items(),
                'prev_page' => $result->currentPage() > 1 ? $result->currentPage() - 1 : null,
                'current_page' => $result->currentPage(),
                'next_page' => $result->hasMorePages() ? $result->currentPage() + 1 : null,
                'total_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
            ];
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Find item by id from resource.
     *
     * @param mixed $id
     * @param array $relation
     * @return Exception|\Illuminate\Database\Eloquent\Model
     */
    public function find($id, array $relation = [])
    {
        try {
            return $this->model
                ->with(empty($relation) ? $this->relation : $relation)
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->findOrFail($id);
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Find item by custom conditions from resource.
     *
     * @param array $conditions
     * @param array $relation
     * @return Exception|\Illuminate\Database\Eloquent\Model
     */
    public function findWhere(array $conditions, array $relation = [])
    {
        try {
            return $this->model
                ->with(empty($relation) ? $this->relation : $relation)
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->where($conditions)
                ->firstOrFail();
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Create new item to resource.
     *
     * @param array $payloads
     * @return Exception|\Illuminate\Database\Eloquent\Model
     */
    public function create($payloads)
    {
        try {
            if (!is_null($this->guardForeignKey)) {
                $payloads[$this->guardForeignKey] = $this->userID();
            }

            DB::beginTransaction();
            $model = $this->model->create($payloads);

            $this->handleFileUploads($model, $payloads);

            DB::commit();

            return $model->fresh();
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Bulk insert items to resource.
     *
     * @param array $payloads
     * @return Exception|bool
     */
    public function insert($payloads)
    {
        try {
            DB::beginTransaction();
            $result = $this->model->insert($payloads);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Update item from resource.
     *
     * @param array $conditions
     * @param array $payloads
     * @return Exception|int
     */
    public function update(array $conditions = [], $payloads)
    {
        try {
            if (!is_null($this->guardForeignKey)) {
                $payloads[$this->guardForeignKey] = $this->userID();
            }

            // Extract file data before update
            $fileData = [];
            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    $fileData[$fileKey] = $payloads[$fileKey];
                    unset($payloads[$fileKey]);
                }
            }

            DB::beginTransaction();

            // Find the model first if we need to handle files
            $model = null;
            if (!empty($fileData)) {
                $model = $this->model::query()->where($conditions)->first();
            }

            $result = $this->model::query()->where($conditions)->update($payloads);

            // Handle file uploads if model was found
            if ($model && !empty($fileData)) {
                $this->handleFileUploads($model, $fileData);
            }

            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Destroy item from resource.
     *
     * @param mixed $id
     * @return Exception|bool|null
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            $result = $this->model
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->findOrFail($id)
                ->delete();
            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Bulk delete items based on an array of IDs.
     *
     * @param array $ids
     * @return bool|Exception
     */
    public function bulk_delete(array $ids)
    {
        try {
            DB::beginTransaction();

            $deleted = $this->model
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->whereIn('id', $ids)
                ->delete();

            DB::commit();

            return $deleted > 0;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Update or create item from resource.
     *
     * @param array $conditions
     * @param array $payloads
     * @return Exception|\Illuminate\Database\Eloquent\Model
     */
    public function update_or_create(array $conditions = [], $payloads)
    {
        try {
            if (!is_null($this->guardForeignKey)) {
                $payloads[$this->guardForeignKey] = $this->userID();
            }

            // Extract file data before update/create
            $fileData = [];
            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    $fileData[$fileKey] = $payloads[$fileKey];
                    unset($payloads[$fileKey]);
                }
            }

            DB::beginTransaction();
            $model = $this->model::query()->updateOrCreate($conditions, $payloads);

            // Handle file uploads
            if (!empty($fileData)) {
                $this->handleFileUploads($model, $fileData);
            }

            DB::commit();

            return $model;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Handle file uploads for media library
     *
     * @param Model $model
     * @param array $fileData
     * @return void
     */
    protected function handleFileUploads(Model $model, array $fileData): void
    {
        foreach ($this->fileKeys as $fileKey) {
            if (isset($fileData[$fileKey]) || request()->hasFile($fileKey)) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($fileAdder) use ($fileKey) {
                        $fileAdder->toMediaCollection($fileKey);
                    });
            }
        }
    }
}