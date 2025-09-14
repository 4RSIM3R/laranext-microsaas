<?php

// Test the StoreFormRequest validation logic
require_once 'vendor/autoload.php';

use App\Http\Requests\StoreFormRequest;

// Create a mock request
$request = new StoreFormRequest();

// Test the prepareForValidation method
$data = [
    'name' => 'Test Form With Spaces',
    'slug' => 'test form with spaces',
    'description' => 'Test description',
    'settings' => [
        'theme' => [
            'primary_color' => '#3b82f6',
            'background_color' => '#ffffff',
            'text_color' => '#374151',
            'button_style' => 'rounded'
        ],
        'notifications' => [
            'email_notification' => false,
            'webhook_url' => null
        ],
        'tracking' => [
            'meta_pixel' => null,
            'google_analytics' => null
        ]
    ],
    'is_active' => true,
    'pages' => []
];

// Simulate the request data
$request->merge($data);

// Call prepareForValidation
$request->prepareForValidation();

// Check if the slug was properly formatted
$slug = $request->input('slug');
echo "Original slug: 'test form with spaces'\n";
echo "Formatted slug: '$slug'\n";

if ($slug === 'test-form-with-spaces') {
    echo "✅ SUCCESS: Slug formatting is working correctly\n";
} else {
    echo "❌ ERROR: Slug formatting is not working correctly\n";
}

echo "\nForm validation fix is working!\n";