<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Form extends Model
{
    /** @use HasFactory<\Database\Factories\FormFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'settings',
        'est_conversion',
        'view_count',
        'is_active',
        'user_id',
    ];

    protected $casts = [
        'settings' => 'array',
        'est_conversion' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class)->orderBy('sort_order');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function getFirstPageAttribute()
    {
        return $this->pages()->first();
    }

    public function getNextPage($currentPageId, $formData = [])
    {
        $currentPage = $this->pages()->find($currentPageId);

        if (!$currentPage) {
            return null;
        }

        // Check if current page has conditional logic
        if (!empty($currentPage->conditional_logic['rules'])) {
            foreach ($currentPage->conditional_logic['rules'] as $rule) {
                if ($this->evaluateCondition($rule, $formData)) {
                    if (isset($rule['next_page_id'])) {
                        return $this->pages()->find($rule['next_page_id']);
                    }
                }
            }
        }

        // Check for simple next_page_id in conditional logic
        if (!empty($currentPage->conditional_logic['next_page_id'])) {
            return $this->pages()->find($currentPage->conditional_logic['next_page_id']);
        }

        // Check for default next page
        if (!empty($currentPage->conditional_logic['default_next_page_id'])) {
            return $this->pages()->find($currentPage->conditional_logic['default_next_page_id']);
        }

        // Default to next page by sort order
        return $this->pages()
            ->where('sort_order', '>', $currentPage->sort_order)
            ->orderBy('sort_order')
            ->first();
    }

    private function evaluateCondition($condition, $formData)
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
            default:
                return false;
        }
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function getAnalytics()
    {
        $submissionCount = $this->submissions()->count();
        $conversionValue = $submissionCount * $this->est_conversion;
        $conversionRate = $this->view_count > 0 ? ($submissionCount / $this->view_count) * 100 : 0;

        return [
            'total_views' => $this->view_count,
            'total_submissions' => $submissionCount,
            'conversion_rate' => round($conversionRate, 2),
            'conversion_value' => $conversionValue,
        ];
    }
}
