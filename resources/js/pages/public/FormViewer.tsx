import MultiSelectCard from '@/components/form/MultiSelectCard';
import SingleCheckboxCard from '@/components/form/SingleCheckboxCard';
import SingleSelectCard from '@/components/form/SingleSelectCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import submissions from '@/routes/submissions';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface FormField {
    id: number;
    label: string;
    name: string;
    type: string;
    placeholder?: string;
    help_text?: string;
    default_value?: string;
    required: boolean;
    validation?: string[];
    options?: Array<{ value: string; label: string }>;
    settings?: Record<string, any>;
}

interface ConditionalRule {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
    next_page_id?: number;
    next_page_offset?: number;
}

interface ConditionalLogic {
    rules?: ConditionalRule[];
    default_next_page_offset?: number | null;
}

interface FormPage {
    id: number;
    title: string;
    description?: string;
    sort_order: number;
    conditions?: any[];
    conditional_logic?: ConditionalLogic;
    settings?: {
        progress_bar?: boolean;
        auto_advance?: boolean;
        button_text?: string;
    };
    fields?: FormField[];
}

interface FormSettings {
    theme: {
        primary_color: string;
        background_color: string;
        text_color: string;
        button_style: 'rounded' | 'pill';
    };
    notifications?: {
        email_notification?: boolean;
        webhook_url?: string;
    };
    tracking?: {
        meta_pixel?: string;
        google_analytics?: string;
    };
}

interface Form {
    id: number;
    name: string;
    slug: string;
    description?: string;
    settings: FormSettings;
    est_conversion?: number;
    is_active: boolean;
    pages?: FormPage[];
}

interface FormViewerProps {
    form: Form;
    isPreview?: boolean;
}

export default function FormViewer({ form, isPreview = false }: FormViewerProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const currentPage = form.pages?.[currentPageIndex];

    // Initialize tracking scripts
    useEffect(() => {
        // Initialize Google Analytics
        if (form.settings.tracking?.google_analytics) {
            const gaId = form.settings.tracking.google_analytics;

            // Validate GA ID format
            if (!/^G-[A-Z0-9]+$/.test(gaId) && !/^UA-\d+-\d+$/.test(gaId)) {
                console.warn('Invalid Google Analytics ID format:', gaId);
                return;
            }

            // Load GA script if not already loaded
            if (!document.querySelector(`script[src*="gtag/js?id=${gaId}"]`)) {
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                script.onerror = () => console.error('Failed to load Google Analytics script');
                document.head.appendChild(script);

                // Initialize gtag
                (window as any).dataLayer = (window as any).dataLayer || [];
                function gtag(...args: any[]) {
                    (window as any).dataLayer.push(args);
                }
                (window as any).gtag = gtag;
                gtag('js', new Date());
                gtag('config', gaId, {
                    page_title: form.name,
                    page_location: window.location.href,
                });
            }
        }

        // Initialize Meta Pixel
        if (form.settings.tracking?.meta_pixel) {
            const pixelId = form.settings.tracking.meta_pixel;

            // Validate Pixel ID format
            if (!/^\d+$/.test(pixelId)) {
                console.warn('Invalid Meta Pixel ID format:', pixelId);
                return;
            }

            // Load Meta Pixel if not already loaded
            if (!(window as any).fbq) {
                const script = document.createElement('script');
                script.innerHTML = `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${pixelId}');
                    fbq('track', 'PageView');
                `;
                script.onerror = () => console.error('Failed to load Meta Pixel script');
                document.head.appendChild(script);

                // Add noscript fallback
                const noscript = document.createElement('noscript');
                noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
                document.head.appendChild(noscript);
            }
        }
    }, [form.settings.tracking, form.name]);

    // Tracking helper function
    const trackEvent = useCallback(
        (eventName: string, parameters: Record<string, any> = {}) => {
            try {
                // Google Analytics tracking
                if (form.settings.tracking?.google_analytics && (window as any).gtag) {
                    (window as any).gtag('event', eventName, {
                        custom_map: { dimension1: 'form_id' },
                        form_id: form.id,
                        form_name: form.name,
                        page_title: currentPage?.title || 'Unknown Page',
                        page_location: window.location.href,
                        ...parameters,
                    });
                }

                // Meta Pixel tracking
                if (form.settings.tracking?.meta_pixel && (window as any).fbq) {
                    (window as any).fbq('track', 'CustomEvent', {
                        event_name: eventName,
                        form_id: form.id,
                        form_name: form.name,
                        page_title: currentPage?.title || 'Unknown Page',
                        ...parameters,
                    });
                }
            } catch (error) {
                console.error('Tracking error:', error);
            }
        },
        [form.settings.tracking, form.id, form.name, currentPage?.title],
    );

    // Track form view
    useEffect(() => {
        trackEvent('form_view', {
            form_id: form.id,
            form_name: form.name,
            page_title: currentPage?.title || 'Unknown Page',
        });
    }, [form.id, form.name, currentPage?.title, trackEvent]);

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData((prev) => {
            // For checkbox fields, we need to handle array values
            if (Array.isArray(value)) {
                return {
                    ...prev,
                    [fieldName]: value,
                };
            }
            return {
                ...prev,
                [fieldName]: value,
            };
        });
    };

    const evaluateCondition = (rule: ConditionalRule, formData: Record<string, any>): boolean => {
        const fieldValue = formData[rule.field];

        switch (rule.operator) {
            case 'equals':
                if (Array.isArray(fieldValue)) {
                    return fieldValue.includes(rule.value);
                }
                return fieldValue == rule.value;
            case 'not_equals':
                if (Array.isArray(fieldValue)) {
                    return !fieldValue.includes(rule.value);
                }
                return fieldValue != rule.value;
            case 'contains':
                return String(fieldValue).includes(String(rule.value));
            case 'greater_than':
                return Number(fieldValue) > Number(rule.value);
            case 'less_than':
                return Number(fieldValue) < Number(rule.value);
            default:
                return false;
        }
    };

    const getNextPageIndex = (currentPage: FormPage, formData: Record<string, any>): number | null => {
        if (!currentPage.conditional_logic) {
            // Default linear progression
            return currentPageIndex < (form.pages?.length || 0) - 1 ? currentPageIndex + 1 : null;
        }

        // Check conditional rules first
        if (currentPage.conditional_logic.rules && currentPage.conditional_logic.rules.length > 0) {
            for (const rule of currentPage.conditional_logic.rules) {
                if (evaluateCondition(rule, formData)) {
                    // Use offset-based navigation first (more reliable)
                    if (rule.next_page_offset !== undefined) {
                        const targetIndex = currentPageIndex + rule.next_page_offset;
                        if (targetIndex < (form.pages?.length || 0)) {
                            console.log(`Using offset navigation: current ${currentPageIndex} + offset ${rule.next_page_offset} = ${targetIndex}`);
                            return targetIndex;
                        }
                    }

                    // Fallback to ID-based navigation
                    if (rule.next_page_id !== undefined) {
                        const targetPageIndex = form.pages?.findIndex((page) => page.id === rule.next_page_id);
                        if (targetPageIndex !== undefined && targetPageIndex !== -1) {
                            console.log(`Found target page: ${rule.next_page_id} at index ${targetPageIndex}`);
                            return targetPageIndex;
                        } else {
                            console.log(`Could not find page with ID: ${rule.next_page_id}`);
                            console.log(
                                'Available pages:',
                                form.pages?.map((p) => ({ id: p.id, title: p.title })),
                            );
                        }
                    }
                }
            }
        }

        // Check for default_next_page_offset
        if (
            currentPage.conditional_logic?.default_next_page_offset !== undefined &&
            currentPage.conditional_logic?.default_next_page_offset !== null
        ) {
            const targetIndex = currentPageIndex + currentPage.conditional_logic.default_next_page_offset;
            if (targetIndex >= 0 && targetIndex < (form.pages?.length || 0)) {
                return targetIndex;
            }
            // If offset leads to invalid index, end the form
            return null;
        }

        // Default to linear progression
        return currentPageIndex < (form.pages?.length || 0) - 1 ? currentPageIndex + 1 : null;
    };

    const handleNext = () => {
        if (!currentPage) return;

        // Validate current page before proceeding
        if (!validateForm()) {
            alert('Please fill in all required fields before continuing.');
            return;
        }

        const nextIndex = getNextPageIndex(currentPage, formData);

        if (nextIndex !== null && nextIndex >= 0) {
            // Track page progression
            trackEvent('form_page_next', {
                form_id: form.id,
                current_page: currentPageIndex + 1,
                next_page: nextIndex + 1,
                page_title: currentPage.title,
            });

            // Add current page to navigation history
            setNavigationHistory((prev) => [...prev, currentPageIndex]);
            setCurrentPageIndex(nextIndex);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (navigationHistory.length > 1) {
            // Remove current page from history and go back to previous page
            const newHistory = navigationHistory.slice(0, -1);
            setNavigationHistory(newHistory);
            setCurrentPageIndex(newHistory[newHistory.length - 1]);
        }
    };

    const validateForm = () => {
        if (!currentPage?.fields) return true;

        for (const field of currentPage.fields) {
            const value = formData[field.name];

            // Check required fields
            if (field.required) {
                if (field.type === 'checkbox' && field.options && field.options.length > 1) {
                    // For multiple checkboxes, at least one must be selected
                    if (!value || (Array.isArray(value) && value.length === 0)) {
                        return false;
                    }
                } else if (field.type === 'checkbox') {
                    // For single checkbox, it must be checked
                    if (!value) {
                        return false;
                    }
                } else {
                    // For other fields, value must not be empty
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        return false;
                    }
                }
            }

            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return false;
                }
            }

            // Phone validation (basic)
            if (field.type === 'phone' && value) {
                const phoneRegex = /^[\d\s\-+()]+$/;
                if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Form submitted:', formData);

            // Track form submission start
            trackEvent('form_submit_start', {
                form_id: form.id,
                form_name: form.name,
                total_pages: form.pages?.length || 0,
            });

            // Prepare submission payload
            const submissionData = {
                form_id: form.id,
                data: formData,
                metadata: {
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    },
                },
            };

            // Make API call
            const response = await axios.post(submissions.submit().url, submissionData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Submission response:', response.data);

            if (response.data.success) {
                // Track successful submission
                trackEvent('form_submit_success', {
                    form_id: form.id,
                    form_name: form.name,
                    submission_id: response.data.submission?.id,
                });

                // Track conversion events for analytics
                try {
                    if (form.settings.tracking?.google_analytics && (window as any).gtag) {
                        (window as any).gtag('event', 'conversion', {
                            send_to: form.settings.tracking.google_analytics,
                            event_category: 'form',
                            event_label: form.name,
                            value: form.est_conversion || 0,
                            currency: 'USD',
                        });
                    }

                    if (form.settings.tracking?.meta_pixel && (window as any).fbq) {
                        (window as any).fbq('track', 'Lead', {
                            content_name: form.name,
                            content_category: 'form_submission',
                            value: form.est_conversion || 0,
                            currency: 'USD',
                        });
                    }
                } catch (error) {
                    console.error('Conversion tracking error:', error);
                }

                setIsSubmitted(true);
            } else {
                // Track submission failure
                trackEvent('form_submit_error', {
                    form_id: form.id,
                    error_message: response.data.message || 'Unknown error',
                });
                alert('Submission failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Submission error:', error);

            // Track submission error
            trackEvent('form_submit_error', {
                form_id: form.id,
                error_message: error.response?.data?.message || error.message || 'Network error',
            });

            alert('Submission failed: ' + (error.response?.data?.message || error.message || 'Network error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.name,
            value: formData[field.name] ?? field.default_value ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                handleFieldChange(field.name, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            className: field.settings?.show_label !== false ? 'mt-2 text-base sm:text-lg p-3 sm:p-4' : 'text-base sm:text-lg p-3 sm:p-4',
        };

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'phone':
            case 'url':
                return (
                    <div key={field.id} className="space-y-3">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name} className="text-lg font-medium sm:text-xl">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <Input type={field.type} {...commonProps} />
                        {field.help_text && (
                            <p className="text-opacity-70 text-base sm:text-lg" style={{ color: form.settings.theme.text_color }}>
                                {field.help_text}
                            </p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-3">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name} className="text-lg font-medium sm:text-xl">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <Textarea {...commonProps} maxLength={field.settings?.max_length} className="min-h-[120px] p-3 text-base sm:p-4 sm:text-lg" />
                        {field.help_text && (
                            <p className="text-opacity-70 text-base sm:text-lg" style={{ color: form.settings.theme.text_color }}>
                                {field.help_text}
                            </p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <SingleSelectCard
                        key={field.id}
                        field={field}
                        selectedValue={formData[field.name] ?? ''}
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                        primaryColor={form.settings.theme.primary_color}
                        textColor={form.settings.theme.text_color}
                    />
                );

            case 'radio':
                return (
                    <SingleSelectCard
                        key={field.id}
                        field={field}
                        selectedValue={formData[field.name] ?? ''}
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                        primaryColor={form.settings.theme.primary_color}
                        textColor={form.settings.theme.text_color}
                    />
                );

            case 'checkbox':
                // Handle multiple checkbox options
                if (field.options && field.options.length > 1) {
                    return (
                        <MultiSelectCard
                            key={field.id}
                            field={field}
                            selectedValues={formData[field.name] || []}
                            onValuesChange={(values) => handleFieldChange(field.name, values)}
                            primaryColor={form.settings.theme.primary_color}
                            textColor={form.settings.theme.text_color}
                        />
                    );
                }

                // Single checkbox
                return (
                    <SingleCheckboxCard
                        key={field.id}
                        field={field}
                        isChecked={formData[field.name] ?? false}
                        onToggle={(checked) => handleFieldChange(field.name, checked)}
                        primaryColor={form.settings.theme.primary_color}
                        textColor={form.settings.theme.text_color}
                    />
                );

            default:
                return null;
        }
    };

    const getButtonStyle = () => {
        const { button_style } = form.settings.theme;
        return button_style === 'pill' ? 'rounded-full' : 'rounded-md';
    };

    if (!currentPage) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">Form Not Found</h1>
                    <p className="text-opacity-80 text-lg sm:text-xl">This form doesn't exist or has no pages.</p>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div
                className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"
                style={{
                    backgroundColor: form.settings.theme.background_color,
                    color: form.settings.theme.text_color,
                }}
            >
                <div className="w-full max-w-3xl space-y-8 text-center">
                    <div className="text-green-500">
                        <svg className="mx-auto h-20 w-20 sm:h-24 sm:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Thank You!</h1>
                        <p className="text-opacity-80 text-lg sm:text-xl" style={{ color: form.settings.theme.text_color }}>
                            Your submission has been received successfully.
                        </p>
                    </div>
                    <div className="text-opacity-70 text-base sm:text-lg" style={{ color: form.settings.theme.text_color }}>
                        <p>We'll get back to you soon.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"
            style={{
                backgroundColor: form.settings.theme.background_color,
                color: form.settings.theme.text_color,
            }}
        >
            <div className="w-full max-w-4xl">
                {/* Preview Badge */}
                {isPreview && (
                    <div className="mb-8 flex justify-center">
                        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                            <AlertCircle className="h-5 w-5" />
                            Preview Mode
                        </Badge>
                    </div>
                )}

                {/* Form Header */}
                <div className="mb-8 text-center sm:mb-12">
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ color: form.settings.theme.text_color }}>
                        {form.name}
                    </h1>
                    {form.description && (
                        <p className="text-opacity-80 mx-auto max-w-2xl text-lg sm:text-xl" style={{ color: form.settings.theme.text_color }}>
                            {form.description}
                        </p>
                    )}
                </div>

                {/* Current Page */}
                <div className="space-y-8 sm:space-y-12">
                    <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">{currentPage.title}</h2>
                        {currentPage.description && (
                            <p className="text-opacity-80 mx-auto max-w-2xl text-lg sm:text-xl" style={{ color: form.settings.theme.text_color }}>
                                {currentPage.description}
                            </p>
                        )}
                    </div>

                    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">{currentPage.fields?.map(renderField)}</div>
                </div>

                {/* Navigation Buttons */}
                <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between sm:mt-12">
                    {navigationHistory.length > 1 ? (
                        <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting} className="px-6 py-3 text-base sm:text-lg">
                            Previous
                        </Button>
                    ) : (
                        <div></div>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className={`${getButtonStyle()} px-8 py-3 text-base font-semibold sm:text-lg`}
                        style={{ backgroundColor: form.settings.theme.primary_color }}
                    >
                        {isSubmitting
                            ? 'Submitting...'
                            : currentPageIndex < (form.pages?.length || 0) - 1
                              ? currentPage.settings?.button_text || 'Continue'
                              : currentPage.settings?.button_text || 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
