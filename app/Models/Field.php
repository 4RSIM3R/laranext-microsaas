<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Field extends Model
{
    /** @use HasFactory<\Database\Factories\FieldFactory> */
    use HasFactory;

    protected $fillable = [
        'page_id',
        'label',
        'name',
        'type',
        'placeholder',
        'help_text',
        'default_value',
        'required',
        'validation',
        'options',
        'conditions',
        'settings',
        'sort_order',
    ];

    protected $casts = [
        'required' => 'boolean',
        'validation' => 'array',
        'options' => 'array',
        'conditions' => 'array',
        'settings' => 'array',
        'sort_order' => 'integer',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function getValidationRules()
    {
        $rules = [];

        if ($this->required) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        switch ($this->type) {
            case 'email':
                $rules[] = 'email';
                break;
            case 'number':
                $rules[] = 'numeric';
                break;
            case 'url':
                $rules[] = 'url';
                break;
        }

        if (!empty($this->validation)) {
            foreach ($this->validation as $rule) {
                $rules[] = $rule;
            }
        }

        return implode('|', $rules);
    }

    public function getFieldTypeOptions()
    {
        return [
            'text' => 'Text Input',
            'email' => 'Email',
            'number' => 'Number',
            'phone' => 'Phone',
            'textarea' => 'Textarea',
            'select' => 'Select Dropdown',
            'radio' => 'Radio Buttons',
            'checkbox' => 'Checkbox',
            'date' => 'Date',
            'file' => 'File Upload',
        ];
    }
}
