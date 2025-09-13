<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\Page;
use App\Models\Field;
use App\Models\User;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?: User::factory()->create();

        // Lead Generation Funnel
        $leadFunnel = Form::create([
            'name' => 'Lead Generation Funnel',
            'slug' => 'lead-generation-funnel',
            'description' => 'Multi-step lead generation form with conditional logic',
            'settings' => [
                'theme' => [
                    'primary_color' => '#3b82f6',
                    'background_color' => '#ffffff',
                    'text_color' => '#1f2937',
                    'button_style' => 'rounded'
                ],
                'notifications' => [
                    'email_notification' => true,
                    'webhook_url' => 'https://hooks.example.com/leads'
                ],
                'tracking' => [
                    'meta_pixel' => '123456789',
                    'google_analytics' => 'UA-123456789-1'
                ]
            ],
            'is_active' => true,
            'user_id' => $user->id,
        ]);

        // Page 1: Basic Information
        $page1 = Page::create([
            'form_id' => $leadFunnel->id,
            'title' => 'Basic Information',
            'description' => 'Let\'s start with some basic details',
            'sort_order' => 1,
            'conditions' => [],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ]);

        Field::create([
            'page_id' => $page1->id,
            'label' => 'Full Name',
            'name' => 'full_name',
            'type' => 'text',
            'placeholder' => 'Enter your full name',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true, 'max_length' => 100]
        ]);

        Field::create([
            'page_id' => $page1->id,
            'label' => 'Email Address',
            'name' => 'email',
            'type' => 'email',
            'placeholder' => 'your.email@example.com',
            'required' => true,
            'validation' => ['email'],
            'sort_order' => 2,
            'settings' => ['show_label' => true]
        ]);

        // Page 2: Company Information
        $page2 = Page::create([
            'form_id' => $leadFunnel->id,
            'title' => 'Company Information',
            'description' => 'Tell us about your company',
            'sort_order' => 2,
            'conditions' => [],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ]);

        Field::create([
            'page_id' => $page2->id,
            'label' => 'Company Name',
            'name' => 'company_name',
            'type' => 'text',
            'placeholder' => 'Your company name',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $page2->id,
            'label' => 'Company Size',
            'name' => 'company_size',
            'type' => 'select',
            'required' => true,
            'sort_order' => 2,
            'options' => [
                ['value' => '', 'label' => 'Select company size'],
                ['value' => '1-10', 'label' => '1-10 employees'],
                ['value' => '11-50', 'label' => '11-50 employees'],
                ['value' => '51-200', 'label' => '51-200 employees'],
                ['value' => '201+', 'label' => '201+ employees']
            ],
            'settings' => ['show_label' => true]
        ]);

        // Page 3: Budget & Timeline
        $page3 = Page::create([
            'form_id' => $leadFunnel->id,
            'title' => 'Budget & Timeline',
            'description' => 'Help us understand your needs better',
            'sort_order' => 3,
            'conditions' => [
                [
                    'field' => 'company_size',
                    'operator' => 'not_equals',
                    'value' => '1-10',
                    'next_page_id' => 4
                ]
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ]);

        Field::create([
            'page_id' => $page3->id,
            'label' => 'Project Budget',
            'name' => 'budget',
            'type' => 'select',
            'required' => true,
            'sort_order' => 1,
            'options' => [
                ['value' => '', 'label' => 'Select budget range'],
                ['value' => '1000-5000', 'label' => '$1,000 - $5,000'],
                ['value' => '5000-10000', 'label' => '$5,000 - $10,000'],
                ['value' => '10000-25000', 'label' => '$10,000 - $25,000'],
                ['value' => '25000+', 'label' => '$25,000+']
            ],
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $page3->id,
            'label' => 'Timeline',
            'name' => 'timeline',
            'type' => 'select',
            'required' => true,
            'sort_order' => 2,
            'options' => [
                ['value' => '', 'label' => 'Select timeline'],
                ['value' => 'immediate', 'label' => 'Immediate (within 1 month)'],
                ['value' => '1-3-months', 'label' => '1-3 months'],
                ['value' => '3-6-months', 'label' => '3-6 months'],
                ['value' => '6+months', 'label' => '6+ months']
            ],
            'settings' => ['show_label' => true]
        ]);

        // Page 4: Additional Requirements (conditional)
        $page4 = Page::create([
            'form_id' => $leadFunnel->id,
            'title' => 'Additional Requirements',
            'description' => 'Tell us more about your project',
            'sort_order' => 4,
            'conditions' => [],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Submit'
            ],
        ]);

        Field::create([
            'page_id' => $page4->id,
            'label' => 'Project Description',
            'name' => 'project_description',
            'type' => 'textarea',
            'placeholder' => 'Describe your project requirements...',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true, 'max_length' => 1000]
        ]);

        Field::create([
            'page_id' => $page4->id,
            'label' => 'How did you hear about us?',
            'name' => 'referral_source',
            'type' => 'select',
            'required' => false,
            'sort_order' => 2,
            'options' => [
                ['value' => '', 'label' => 'Select an option'],
                ['value' => 'google', 'label' => 'Google Search'],
                ['value' => 'social', 'label' => 'Social Media'],
                ['value' => 'referral', 'label' => 'Referral'],
                ['value' => 'other', 'label' => 'Other']
            ],
            'settings' => ['show_label' => true]
        ]);

        // Simple Contact Form
        $contactForm = Form::create([
            'name' => 'Simple Contact Form',
            'slug' => 'simple-contact-form',
            'description' => 'Basic contact form for quick inquiries',
            'settings' => [
                'theme' => [
                    'primary_color' => '#10b981',
                    'background_color' => '#f3f4f6',
                    'text_color' => '#374151',
                    'button_style' => 'pill'
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
            'user_id' => $user->id,
        ]);

        $contactPage = Page::create([
            'form_id' => $contactForm->id,
            'title' => 'Contact Us',
            'description' => 'Get in touch with us',
            'sort_order' => 1,
            'settings' => [
                'progress_bar' => false,
                'auto_advance' => false,
                'button_text' => 'Send Message'
            ],
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Name',
            'name' => 'name',
            'type' => 'text',
            'placeholder' => 'Your name',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Email',
            'name' => 'email',
            'type' => 'email',
            'placeholder' => 'your.email@example.com',
            'required' => true,
            'validation' => ['email'],
            'sort_order' => 2,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Message',
            'name' => 'message',
            'type' => 'textarea',
            'placeholder' => 'Your message...',
            'required' => true,
            'sort_order' => 3,
            'settings' => ['show_label' => true, 'max_length' => 500]
        ]);

        // Age-Based Funnel Form
        $ageFunnel = Form::create([
            'name' => 'Age-Based Funnel',
            'slug' => 'age-based-funnel',
            'description' => 'Conditional logic form based on age selection',
            'settings' => [
                'theme' => [
                    'primary_color' => '#8b5cf6',
                    'background_color' => '#f8fafc',
                    'text_color' => '#1e293b',
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
            'user_id' => $user->id,
        ]);

        // Page 1: Age Selection
        $agePage = Page::create([
            'form_id' => $ageFunnel->id,
            'title' => 'What\'s Your Age?',
            'description' => 'Please select your age group to continue',
            'sort_order' => 1,
            'conditions' => [],
            'conditional_logic' => [
                'rules' => [
                    [
                        'field' => 'age_group',
                        'operator' => 'equals',
                        'value' => 'under_17',
                        'next_page_offset' => 1 // Go to next page (index + 1)
                    ],
                    [
                        'field' => 'age_group',
                        'operator' => 'equals',
                        'value' => '17_or_older',
                        'next_page_offset' => 2 // Go to page after next (index + 2)
                    ]
                ],
                'default_next_page_id' => null // Must make a selection
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ]);

        Field::create([
            'page_id' => $agePage->id,
            'label' => 'Age Group',
            'name' => 'age_group',
            'type' => 'radio',
            'required' => true,
            'sort_order' => 1,
            'options' => [
                ['value' => 'under_17', 'label' => 'Under 17 years old'],
                ['value' => '17_or_older', 'label' => '17 years or older']
            ],
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $agePage->id,
            'label' => 'Email Address',
            'name' => 'email',
            'type' => 'email',
            'placeholder' => 'your.email@example.com',
            'required' => true,
            'validation' => ['email'],
            'sort_order' => 2,
            'settings' => ['show_label' => true]
        ]);

        // Page 2: Parental Consent (for under 17)
        $under17Page = Page::create([
            'form_id' => $ageFunnel->id,
            'title' => 'Parental Consent Required',
            'description' => 'We need parental consent for users under 17',
            'sort_order' => 2,
            'conditions' => [],
            'conditional_logic' => [
                'rules' => [
                    [
                        'field' => 'age_group',
                        'operator' => 'equals',
                        'value' => 'under_17'
                    ]
                ],
                'next_page_id' => null, // This is the final page for this path
                'default_next_page_id' => null // No default, only show if condition matches
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Submit'
            ],
        ]);

        Field::create([
            'page_id' => $under17Page->id,
            'label' => 'Parent/Guardian Name',
            'name' => 'parent_name',
            'type' => 'text',
            'placeholder' => 'Parent or guardian full name',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $under17Page->id,
            'label' => 'Parent/Guardian Email',
            'name' => 'parent_email',
            'type' => 'email',
            'placeholder' => 'parent.email@example.com',
            'required' => true,
            'validation' => ['email'],
            'sort_order' => 2,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $under17Page->id,
            'label' => 'Interests',
            'name' => 'interests',
            'type' => 'checkbox',
            'required' => false,
            'sort_order' => 3,
            'options' => [
                ['value' => 'gaming', 'label' => 'Gaming'],
                ['value' => 'sports', 'label' => 'Sports'],
                ['value' => 'music', 'label' => 'Music'],
                ['value' => 'art', 'label' => 'Art'],
                ['value' => 'technology', 'label' => 'Technology']
            ],
            'settings' => ['show_label' => true]
        ]);

        // Page 3: Contact Information (for 17 or older)
        $contactPage = Page::create([
            'form_id' => $ageFunnel->id,
            'title' => 'Contact Information',
            'description' => 'Please provide your contact details',
            'sort_order' => 3,
            'conditions' => [],
            'conditional_logic' => [
                'rules' => [
                    [
                        'field' => 'age_group',
                        'operator' => 'equals',
                        'value' => '17_or_older'
                    ]
                ],
                'next_page_id' => null, // This is the final page for this path
                'default_next_page_id' => null // No default, only show if condition matches
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Submit'
            ],
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Phone Number',
            'name' => 'phone',
            'type' => 'phone',
            'placeholder' => 'Your phone number',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Address',
            'name' => 'address',
            'type' => 'textarea',
            'placeholder' => 'Your street address',
            'required' => true,
            'sort_order' => 2,
            'settings' => ['show_label' => true, 'max_length' => 200]
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'Preferred Contact Method',
            'name' => 'contact_method',
            'type' => 'radio',
            'required' => true,
            'sort_order' => 3,
            'options' => [
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'phone', 'label' => 'Phone'],
                ['value' => 'both', 'label' => 'Both Email and Phone']
            ],
            'settings' => ['show_label' => true]
        ]);

        Field::create([
            'page_id' => $contactPage->id,
            'label' => 'How did you hear about us?',
            'name' => 'referral_source',
            'type' => 'select',
            'required' => false,
            'sort_order' => 4,
            'options' => [
                ['value' => '', 'label' => 'Select an option'],
                ['value' => 'google', 'label' => 'Google Search'],
                ['value' => 'social', 'label' => 'Social Media'],
                ['value' => 'friend', 'label' => 'Friend/Referral'],
                ['value' => 'advertisement', 'label' => 'Advertisement'],
                ['value' => 'other', 'label' => 'Other']
            ],
            'settings' => ['show_label' => true]
        ]);

        // Simple Linear Form Example
        $linearForm = Form::create([
            'name' => 'Simple Linear Form',
            'slug' => 'simple-linear-form',
            'description' => 'Example of linear form with simple next page logic',
            'settings' => [
                'theme' => [
                    'primary_color' => '#06b6d4',
                    'background_color' => '#ffffff',
                    'text_color' => '#374151',
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
            'user_id' => $user->id,
        ]);

        // Page 1: Basic Info with simple next page logic
        $linearPage1 = Page::create([
            'form_id' => $linearForm->id,
            'title' => 'Basic Information',
            'description' => 'Tell us about yourself',
            'sort_order' => 1,
            'conditions' => [],
            'conditional_logic' => [
                'rules' => [], // No conditional rules
                'next_page_id' => 2, // Always go to page 2
                'default_next_page_id' => 2 // Default next page
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Continue'
            ],
        ]);

        Field::create([
            'page_id' => $linearPage1->id,
            'label' => 'Name',
            'name' => 'name',
            'type' => 'text',
            'placeholder' => 'Your full name',
            'required' => true,
            'sort_order' => 1,
            'settings' => ['show_label' => true]
        ]);

        // Page 2: Final page
        $linearPage2 = Page::create([
            'form_id' => $linearForm->id,
            'title' => 'Additional Details',
            'description' => 'A few more details',
            'sort_order' => 2,
            'conditions' => [],
            'conditional_logic' => [
                'rules' => [], // No conditional rules
                'next_page_id' => null, // This is the final page
                'default_next_page_id' => null
            ],
            'settings' => [
                'progress_bar' => true,
                'auto_advance' => false,
                'button_text' => 'Submit'
            ],
        ]);

        Field::create([
            'page_id' => $linearPage2->id,
            'label' => 'Comments',
            'name' => 'comments',
            'type' => 'textarea',
            'placeholder' => 'Any additional comments...',
            'required' => false,
            'sort_order' => 1,
            'settings' => ['show_label' => true, 'max_length' => 300]
        ]);
    }
}
