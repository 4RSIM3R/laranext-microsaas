<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Page;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Field>
 */
class FieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['text', 'email', 'number', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date'];
        $type = $this->faker->randomElement($types);

        $field = [
            'page_id' => Page::factory(),
            'label' => $this->faker->words(2, true),
            'name' => $this->faker->unique()->slug(1, '_'),
            'type' => $type,
            'placeholder' => $this->faker->sentence(3),
            'help_text' => $this->faker->optional()->sentence(),
            'default_value' => $this->faker->optional()->word(),
            'required' => $this->faker->boolean(70),
            'validation' => [],
            'options' => [],
            'conditions' => [],
            'settings' => [
                'show_label' => true,
                'show_placeholder' => true,
                'max_length' => 255
            ],
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];

        // Add type-specific configurations
        switch ($type) {
            case 'select':
            case 'radio':
                $field['options'] = [
                    ['value' => 'option1', 'label' => 'Option 1'],
                    ['value' => 'option2', 'label' => 'Option 2'],
                    ['value' => 'option3', 'label' => 'Option 3']
                ];
                break;
            case 'checkbox':
                $field['options'] = [
                    ['value' => 'yes', 'label' => 'Yes, I agree']
                ];
                break;
            case 'number':
                $field['validation'][] = 'numeric';
                $field['settings']['min_value'] = 0;
                $field['settings']['max_value'] = 1000;
                break;
            case 'email':
                $field['validation'][] = 'email';
                break;
        }

        return $field;
    }

    public function textInput()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
            'label' => 'Full Name',
            'name' => 'full_name',
            'placeholder' => 'Enter your full name',
            'required' => true,
        ]);
    }

    public function emailField()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'email',
            'label' => 'Email Address',
            'name' => 'email',
            'placeholder' => 'your.email@example.com',
            'required' => true,
            'validation' => ['email'],
        ]);
    }

    public function phoneField()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'phone',
            'label' => 'Phone Number',
            'name' => 'phone',
            'placeholder' => '+1 (555) 123-4567',
            'required' => false,
        ]);
    }

    public function withConditionalLogic()
    {
        return $this->state(fn (array $attributes) => [
            'conditions' => [
                [
                    'field' => 'plan_type',
                    'operator' => 'equals',
                    'value' => 'premium'
                ]
            ]
        ]);
    }

    public function selectField($options = [])
    {
        $defaultOptions = [
            ['value' => '', 'label' => 'Select an option'],
            ['value' => 'basic', 'label' => 'Basic Plan'],
            ['value' => 'premium', 'label' => 'Premium Plan'],
            ['value' => 'enterprise', 'label' => 'Enterprise Plan'],
        ];

        return $this->state(fn (array $attributes) => [
            'type' => 'select',
            'label' => 'Plan Type',
            'name' => 'plan_type',
            'options' => !empty($options) ? $options : $defaultOptions,
            'required' => true,
        ]);
    }
}
