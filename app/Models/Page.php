<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    /** @use HasFactory<\Database\Factories\PageFactory> */
    use HasFactory;

    protected $fillable = [
        'form_id',
        'title',
        'description',
        'sort_order',
        'conditions',
        'conditional_logic',
        'settings',
    ];

    protected $casts = [
        'conditions' => 'array',
        'conditional_logic' => 'array',
        'settings' => 'array',
        'sort_order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(Field::class)->orderBy('sort_order');
    }

    public function getVisibleFields($formData = [])
    {
        return $this->fields()->filter(function ($field) use ($formData) {
            if (empty($field->conditions)) {
                return true;
            }

            foreach ($field->conditions as $condition) {
                if ($this->evaluateFieldCondition($condition, $formData)) {
                    return true;
                }
            }

            return false;
        });
    }

    private function evaluateFieldCondition($condition, $formData)
    {
        $fieldValue = $formData[$condition['field']] ?? null;

        switch ($condition['operator']) {
            case 'equals':
                return $fieldValue == $condition['value'];
            case 'not_equals':
                return $fieldValue != $condition['value'];
            case 'contains':
                return str_contains($fieldValue, $condition['value']);
            case 'greater_than':
                return $fieldValue > $condition['value'];
            case 'less_than':
                return $fieldValue < $condition['value'];
            case 'in':
                return in_array($fieldValue, $condition['value']);
            default:
                return false;
        }
    }

    public function isLastPage()
    {
        return !$this->form->pages()->where('sort_order', '>', $this->sort_order)->exists();
    }
}
