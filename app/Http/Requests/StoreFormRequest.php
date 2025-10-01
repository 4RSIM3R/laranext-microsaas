<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFormRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|regex:/^[a-z0-9-]+$/',
            'description' => 'nullable|string|max:1000',
            'submission_rate' => 'required|numeric|min:0',
            'settings.theme.primary_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'settings.theme.background_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'settings.theme.text_color' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'settings.theme.button_style' => 'required|in:rounded,pill',
            'settings.notifications.email_notification' => 'required|boolean',
            'settings.notifications.webhook_url' => 'nullable|url|max:500',
            'settings.tracking.meta_pixel' => 'nullable|string|max:50',
            'settings.tracking.google_analytics' => 'nullable|string|max:50',
            'is_active' => 'required|boolean',
            'pages' => 'nullable|array',
            'pages.*.id' => 'nullable|integer',
            'pages.*.title' => 'required|string|max:255',
            'pages.*.description' => 'nullable|string|max:1000',
            'pages.*.sort_order' => 'required|integer|min:1',
            'pages.*.settings.progress_bar' => 'required|boolean',
            'pages.*.settings.auto_advance' => 'required|boolean',
            'pages.*.settings.button_text' => 'required|string|max:50',
            'pages.*.conditional_logic' => 'nullable|array',
            'pages.*.conditional_logic.default_next_page_offset' => 'nullable|integer|min:1',
            'pages.*.conditional_logic.rules' => 'nullable|array',
            'pages.*.conditional_logic.rules.*.field' => 'required|string|max:255',
            'pages.*.conditional_logic.rules.*.operator' => 'required|in:equals,not_equals,contains,greater_than,less_than,in',
            'pages.*.conditional_logic.rules.*.value' => 'required',
            'pages.*.conditional_logic.rules.*.next_page_offset' => 'nullable|integer|min:1',
            'pages.*.fields' => 'nullable|array',
            'pages.*.fields.*.id' => 'nullable|integer',
            'pages.*.fields.*.label' => 'required|string|max:255',
            'pages.*.fields.*.name' => 'required|string|max:255|regex:/^[a-zA-Z0-9_]+$/',
            'pages.*.fields.*.type' => 'required|in:text,email,number,phone,textarea,select,radio,checkbox,date,file,url',
            'pages.*.fields.*.placeholder' => 'nullable|string|max:255',
            'pages.*.fields.*.help_text' => 'nullable|string|max:500',
            'pages.*.fields.*.default_value' => 'nullable|string|max:1000',
            'pages.*.fields.*.required' => 'required|boolean',
            'pages.*.fields.*.validation' => 'nullable|array',
            'pages.*.fields.*.conditions' => 'nullable|array',
            'pages.*.fields.*.conditions.*.field' => 'required|string|max:255',
            'pages.*.fields.*.conditions.*.operator' => 'required|in:equals,not_equals,contains,greater_than,less_than,in',
            'pages.*.fields.*.conditions.*.value' => 'required',
            'pages.*.fields.*.options' => 'nullable|array',
            'pages.*.fields.*.options.*.value' => 'required|string|max:255',
            'pages.*.fields.*.options.*.label' => 'required|string|max:255',
            'pages.*.fields.*.settings.show_label' => 'required|boolean',
            'pages.*.fields.*.settings.show_placeholder' => 'required|boolean',
            'pages.*.fields.*.settings.max_length' => 'nullable|integer|min:1',
            'pages.*.fields.*.settings.min_value' => 'nullable|numeric',
            'pages.*.fields.*.settings.max_value' => 'nullable|numeric',
            'pages.*.fields.*.sort_order' => 'required|integer|min:1',
        ];
    }

    /**
     * Get the custom messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Form name is required.',
            'slug.required' => 'Form slug is required.',
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'submission_rate.required' => 'Submission rate is required.',
            'submission_rate.numeric' => 'Submission rate must be a valid number.',
            'submission_rate.min' => 'Submission rate cannot be negative.',
            'settings.theme.primary_color.regex' => 'Primary color must be a valid hex color code.',
            'settings.theme.background_color.regex' => 'Background color must be a valid hex color code.',
            'settings.theme.text_color.regex' => 'Text color must be a valid hex color code.',
            'settings.theme.button_style.in' => 'Button style must be either rounded or pill.',
            'settings.notifications.webhook_url.url' => 'Webhook URL must be a valid URL.',
            'is_active.required' => 'Active status is required.',
        ];
    }
}
