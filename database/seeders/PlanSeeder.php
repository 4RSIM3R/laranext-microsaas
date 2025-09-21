<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plan = Plan::create([
            'name' => 'Funnel Builder Pro',
            'slug' => 'funnel-builder-pro',
            'description' => 'Everything you need to create high-converting funnel forms',
            'is_active' => true,
            'price' => 10.00,
            'trial_period' => 7,
            'trial_interval' => 'day',
            'invoice_period' => 1,
            'invoice_interval' => 'month',
            'grace_period' => 3,
            'grace_interval' => 'day',
            'prorate_day' => 1,
            'prorate_period' => 1,
            'prorate_extend_due' => 1,
            'sort_order' => 1,
            'stripe_price_id' => 'price_1S6DeSRrYVQ7dJWV7E6UhQqn',
            'currency' => 'usd'
        ]);

        // Add features for the funnel builder plan
        $features = [
            [
                'name' => 'Unlimited Forms',
                'slug' => 'unlimited-forms',
                'description' => 'Create as many forms as you need',
                'value' => 'unlimited',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 1,
            ],
            [
                'name' => 'Advanced Funnel Logic',
                'slug' => 'advanced-funnel-logic',
                'description' => 'Multi-page forms with conditional logic',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 2,
            ],
            [
                'name' => 'Submissions per Month',
                'slug' => 'submissions-per-month',
                'description' => 'Number of form submissions per month',
                'value' => 1000,
                'resettable_period' => 1,
                'resettable_interval' => 'month',
                'sort_order' => 3,
            ],
            [
                'name' => 'Custom Themes',
                'slug' => 'custom-themes',
                'description' => 'Fully customizable form themes and branding',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 4,
            ],
            [
                'name' => 'Email Notifications',
                'slug' => 'email-notifications',
                'description' => 'Instant email alerts for new submissions',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 5,
            ],
            [
                'name' => 'Analytics Dashboard',
                'slug' => 'analytics-dashboard',
                'description' => 'Detailed conversion analytics and insights',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 6,
            ],
            [
                'name' => 'A/B Testing',
                'slug' => 'ab-testing',
                'description' => 'Test different form versions to optimize conversions',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 7,
            ],
            [
                'name' => 'Integrations',
                'slug' => 'integrations',
                'description' => 'Connect with Google Analytics, Meta Pixel, and more',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 8,
            ],
            [
                'name' => 'API Access',
                'slug' => 'api-access',
                'description' => 'RESTful API for custom integrations',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 9,
            ],
            [
                'name' => 'Priority Support',
                'slug' => 'priority-support',
                'description' => '24/7 email support with priority response',
                'value' => 'enabled',
                'resettable_period' => 0,
                'resettable_interval' => 'month',
                'sort_order' => 10,
            ],
        ];

        foreach ($features as $feature) {
            $plan->features()->create($feature);
        }

        $this->command->info('Funnel Builder Pro plan seeded successfully!');
    }
}
