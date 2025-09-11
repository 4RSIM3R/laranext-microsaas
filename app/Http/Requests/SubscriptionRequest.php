<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'plan_id.required' => 'Please select a plan.',
            'plan_id.exists' => 'The selected plan is invalid.',
            'payment_method.required' => 'Payment method is required.',
        ];
    }
}
