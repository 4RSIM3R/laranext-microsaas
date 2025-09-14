<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Form;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Page>
 */
class PageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'form_id' => Form::factory(),
            'title' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'sort_order' => $this->faker->numberBetween(1, 10),
            'conditional_logic' => [
                'rules' => [],
                'default_next_page_offset' => 1
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ];
    }

    public function withConditionalLogic()
    {
        return $this->state(fn (array $attributes) => [
            'conditional_logic' => [
                'rules' => [
                    [
                        'field' => 'email',
                        'operator' => 'contains',
                        'value' => '@gmail.com',
                        'next_page_offset' => 1
                    ],
                    [
                        'field' => 'budget',
                        'operator' => 'greater_than',
                        'value' => 1000,
                        'next_page_offset' => 2
                    ]
                ],
                'default_next_page_offset' => null
            ]
        ]);
    }

    public function firstPage()
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Getting Started',
            'description' => 'Let us know a bit about you',
            'sort_order' => 1,
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Get Started'
            ]
        ]);
    }

    public function lastPage()
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Almost Done!',
            'description' => 'Just a few more details',
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Submit'
            ]
        ]);
    }
}
