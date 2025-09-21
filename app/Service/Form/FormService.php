<?php

namespace App\Service\Form;

use App\Contract\Form\FormContract;
use App\Models\Form;
use App\Models\Page;
use App\Service\BaseService;
use Illuminate\Support\Str;
use Exception;

class FormService extends BaseService implements FormContract
{
    protected string|null $guard = 'user';
    protected string|null $guardForeignKey = 'user_id';
    protected array $relation = ['pages', 'pages.fields'];

    public function __construct(Form $model)
    {
        $this->model = $model;
    }

    public function findBySlug(string $slug)
    {
        return $this->model->where('slug', $slug)->with($this->relation)->first();
    }

    public function findByEmbedCode(string $embedCode)
    {
        return $this->model->where('embed_code', $embedCode)->with($this->relation)->first();
    }

    public function generateEmbedCode(int $id)
    {
        $form = $this->find($id);
        if (!$form) {
            throw new Exception('Form not found');
        }

        // Generate unique embed code
        do {
            $embedCode = Str::random(16);
        } while ($this->model->where('embed_code', $embedCode)->exists());

        $form->embed_code = $embedCode;
        $form->save();

        return $form->fresh();
    }

    public function createWithPages(array $data, array $pages = [])
    {
        $data['slug'] = Str::slug($data['name']);

        // Ensure unique slug
        $count = 1;
        $originalSlug = $data['slug'];
        while ($this->model->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        $form = $this->create($data);

        if (!empty($pages)) {
            foreach ($pages as $index => $pageData) {
                $pageData['form_id'] = $form->id;
                $pageData['sort_order'] = $index + 1;

                $fields = $pageData['fields'] ?? [];
                unset($pageData['fields']);

                $page = Page::create($pageData);

                if (!empty($fields)) {
                    foreach ($fields as $fieldIndex => $fieldData) {
                        $fieldData['page_id'] = $page->id;
                        $fieldData['sort_order'] = $fieldIndex + 1;
                        \App\Models\Field::create($fieldData);
                    }
                }
            }
        }

        return $form->fresh($this->relation);
    }

    public function updateWithPages(int $id, array $data, array $pages = [])
    {
        $form = $this->find($id);

        if (!$form) {
            throw new Exception('Form not found');
        }

        // Update form data
        $form->update($data);

        if (!empty($pages)) {
            // Delete existing pages and their fields
            $form->pages()->each(function ($page) {
                $page->fields()->delete();
                $page->delete();
            });

            // Create new pages
            foreach ($pages as $index => $pageData) {
                $pageData['form_id'] = $form->id;
                $pageData['sort_order'] = $index + 1;

                $fields = $pageData['fields'] ?? [];
                unset($pageData['fields']);

                $page = Page::create($pageData);

                if (!empty($fields)) {
                    foreach ($fields as $fieldIndex => $fieldData) {
                        $fieldData['page_id'] = $page->id;
                        $fieldData['sort_order'] = $fieldIndex + 1;
                        \App\Models\Field::create($fieldData);
                    }
                }
            }
        }

        return $form->fresh($this->relation);
    }

    public function duplicate(int $id)
    {
        $originalForm = $this->find($id);

        if (!$originalForm) {
            throw new Exception('Form not found');
        }

        $newFormData = $originalForm->toArray();
        unset($newFormData['id'], $newFormData['created_at'], $newFormData['updated_at']);
        $newFormData['name'] = $newFormData['name'] . ' (Copy)';
        $newFormData['slug'] = Str::slug($newFormData['name']);

        // Ensure unique slug
        $count = 1;
        $originalSlug = $newFormData['slug'];
        while ($this->model->where('slug', $newFormData['slug'])->exists()) {
            $newFormData['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        $pages = [];
        foreach ($originalForm->pages as $page) {
            $pageData = $page->toArray();
            unset($pageData['id'], $pageData['form_id'], $pageData['created_at'], $pageData['updated_at']);

            $fields = [];
            foreach ($page->fields as $field) {
                $fieldData = $field->toArray();
                unset($fieldData['id'], $fieldData['page_id'], $fieldData['created_at'], $fieldData['updated_at']);
                $fields[] = $fieldData;
            }

            $pageData['fields'] = $fields;
            $pages[] = $pageData;
        }

        return $this->createWithPages($newFormData, $pages);
    }

    public function getFormsByUser(int $userId)
    {
        return $this->model->where('user_id', $userId)
            ->with($this->relation)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function toggleActive(int $id)
    {
        $form = $this->find($id);
        if (!$form) {
            throw new Exception('Form not found');
        }

        $form->is_active = !$form->is_active;
        $form->save();

        return $form;
    }
}
