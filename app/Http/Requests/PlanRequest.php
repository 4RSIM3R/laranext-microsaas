<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $planId = $this->route('id') ?? $this->route('plan');

        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug,' . $planId,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'price' => 'required|numeric|min:0',
            'signup_fee' => 'numeric|min:0',
            'trial_period' => 'integer|min:0',
            'trial_interval' => 'required|string|in:day,week,month,year',
            'invoice_period' => 'required|integer|min:1',
            'invoice_interval' => 'required|string|in:day,week,month,year',
            'grace_period' => 'integer|min:0',
            'grace_interval' => 'required|string|in:day,week,month,year',
            'prorate_day' => 'nullable|integer|min:1|max:31',
            'prorate_period' => 'nullable|integer|min:0',
            'prorate_extend_due' => 'nullable|integer|min:0',
            'active_subscribers_limit' => 'nullable|integer|min:1',
            'sort_order' => 'integer|min:0',
            'currency' => 'required|string|size:3',

            // Features validation
            'features' => 'array',
            'features.*.name' => 'required|string|max:255',
            'features.*.slug' => 'required|string|max:255',
            'features.*.description' => 'nullable|string',
            'features.*.value' => 'required|string|max:255',
            'features.*.resettable_period' => 'integer|min:0',
            'features.*.resettable_interval' => 'required|string|in:day,week,month,year',
            'features.*.sort_order' => 'integer|min:0',
        ];
    }
}
