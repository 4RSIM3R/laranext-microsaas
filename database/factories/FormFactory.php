<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Form>
 */
class FormFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->sentence(),
            'settings' => [
                'theme' => [
                    'primary_color' => '#3b82f6',
                    'background_color' => '#ffffff',
                    'text_color' => '#1f2937',
                    'button_style' => 'rounded'
                ],
                'notifications' => [
                    'email_notification' => true,
                    'webhook_url' => null
                ],
                'tracking' => [
                    'meta_pixel' => null,
                    'google_analytics' => null
                ]
            ],
            'is_active' => true,
            'user_id' => User::factory(),
        ];
    }

    public function inactive()
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withBasicSettings()
    {
        return $this->state(fn (array $attributes) => [
            'settings' => [
                'theme' => [
                    'primary_color' => '#10b981',
                    'background_color' => '#f3f4f6',
                    'text_color' => '#374151',
                    'button_style' => 'pill'
                ],
                'notifications' => [
                    'email_notification' => true,
                    'webhook_url' => 'https://hooks.example.com/webhook'
                ],
                'tracking' => [
                    'meta_pixel' => '123456789',
                    'google_analytics' => 'UA-123456789-1'
                ]
            ]
        ]);
    }
}
