import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    next_page_id?: number | null;
    default_next_page_id?: number | null;
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
    is_active: boolean;
    pages?: FormPage[];
}

interface FormViewerProps {
    form: Form;
    isPreview?: boolean;
}

export default function FormViewer({ form, isPreview = false }: FormViewerProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [showJson, setShowJson] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const currentPage = form.pages?.[currentPageIndex];
    const progress = form.pages ? ((currentPageIndex + 1) / form.pages.length) * 100 : 0;

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => {
            // For checkbox fields, we need to handle array values
            if (Array.isArray(value)) {
                return {
                    ...prev,
                    [fieldName]: value
                };
            }
            return {
                ...prev,
                [fieldName]: value
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
                        const targetPageIndex = form.pages?.findIndex(page => page.id === rule.next_page_id);
                        if (targetPageIndex !== undefined && targetPageIndex !== -1) {
                            console.log(`Found target page: ${rule.next_page_id} at index ${targetPageIndex}`);
                            return targetPageIndex;
                        } else {
                            console.log(`Could not find page with ID: ${rule.next_page_id}`);
                            console.log('Available pages:', form.pages?.map(p => ({ id: p.id, title: p.title })));
                        }
                    }
                }
            }
        }

        // Check for simple next_page_id
        if (currentPage.conditional_logic?.next_page_id !== undefined && currentPage.conditional_logic?.next_page_id !== null) {
            const targetPageIndex = form.pages?.findIndex(page => page.id === currentPage.conditional_logic?.next_page_id);
            return targetPageIndex !== -1 ? targetPageIndex! : null;
        }

        // Check for default_next_page_id
        if (currentPage.conditional_logic?.default_next_page_id !== undefined && currentPage.conditional_logic?.default_next_page_id !== null) {
            const targetPageIndex = form.pages?.findIndex(page => page.id === currentPage.conditional_logic?.default_next_page_id);
            return targetPageIndex !== -1 ? targetPageIndex! : null;
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
            setCurrentPageIndex(nextIndex);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
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

        // Simulate form submission
        console.log('Form submitted:', formData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.name,
            value: formData[field.name] ?? field.default_value ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                handleFieldChange(field.name, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            className: field.settings?.show_label !== false ? 'mt-1' : ''
        };

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'phone':
            case 'url':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        )}
                        <Input
                            type={field.type}
                            {...commonProps}
                        />
                        {field.help_text && (
                            <p className="text-sm text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        )}
                        <Textarea
                            {...commonProps}
                            maxLength={field.settings?.max_length}
                        />
                        {field.help_text && (
                            <p className="text-sm text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        )}
                        <Select
                            value={formData[field.name] ?? ''}
                            onValueChange={(value) => handleFieldChange(field.name, value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || 'Select an option'} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.filter(option => option.value !== '').map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.help_text && (
                            <p className="text-sm text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        )}
                        <RadioGroup
                            value={formData[field.name] ?? ''}
                            onValueChange={(value) => handleFieldChange(field.name, value)}
                        >
                            {field.options?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={field.name + option.value} />
                                    <Label htmlFor={field.name + option.value}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {field.help_text && (
                            <p className="text-sm text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
                );

            case 'checkbox':
                // Handle multiple checkbox options
                if (field.options && field.options.length > 1) {
                    const selectedValues = formData[field.name] || [];
                    return (
                        <div key={field.id} className="space-y-2">
                            {field.settings?.show_label !== false && (
                                <Label>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                            )}
                            <div className="space-y-2">
                                {field.options.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={field.name + option.value}
                                            checked={selectedValues.includes(option.value)}
                                            onCheckedChange={(checked) => {
                                                const newValues = checked
                                                    ? [...selectedValues, option.value]
                                                    : selectedValues.filter((v: string) => v !== option.value);
                                                handleFieldChange(field.name, newValues);
                                            }}
                                        />
                                        <Label htmlFor={field.name + option.value}>
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {field.help_text && (
                                <p className="text-sm text-muted-foreground">{field.help_text}</p>
                            )}
                        </div>
                    );
                }

                // Single checkbox
                return (
                    <div key={field.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={field.name}
                                checked={formData[field.name] ?? false}
                                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                            />
                            {field.settings?.show_label !== false && (
                                <Label htmlFor={field.name}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                            )}
                        </div>
                        {field.help_text && (
                            <p className="text-sm text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
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
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center">Form not found or has no pages.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{
                    backgroundColor: form.settings.theme.background_color,
                    color: form.settings.theme.text_color
                }}
            >
                <div className="w-full max-w-2xl">
                    <Card className="shadow-lg">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="text-green-500">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold">Thank You!</h1>
                                <p className="text-muted-foreground">
                                    Your submission has been received successfully.
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>We'll get back to you soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: form.settings.theme.background_color,
                color: form.settings.theme.text_color
            }}
        >
            <div className="w-full max-w-2xl">
                {/* Preview Badge */}
                {isPreview && (
                    <div className="mb-4 flex justify-center">
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Preview Mode
                        </Badge>
                    </div>
                )}

                {/* Form Container */}
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl" style={{ color: form.settings.theme.text_color }}>
                            {form.name}
                        </CardTitle>
                        {form.description && (
                            <CardDescription className="text-base">
                                {form.description}
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        {currentPage.settings?.progress_bar && form.pages && form.pages.length > 1 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Step {currentPageIndex + 1} of {form.pages.length}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        {/* Current Page */}
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-semibold">{currentPage.title}</h2>
                                {currentPage.description && (
                                    <p className="text-muted-foreground">{currentPage.description}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                {currentPage.fields?.map(renderField)}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            {currentPageIndex > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={isSubmitting}
                                >
                                    Previous
                                </Button>
                            )}

                            <div className="flex-1"></div>

                            <Button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className={getButtonStyle()}
                                style={{ backgroundColor: form.settings.theme.primary_color }}
                            >
                                {isSubmitting ? 'Submitting...' : (
                                    currentPageIndex < (form.pages?.length || 0) - 1
                                        ? currentPage.settings?.button_text || 'Continue'
                                        : currentPage.settings?.button_text || 'Submit'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* JSON Viewer Toggle */}
                <div className="mt-4 text-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowJson(!showJson)}
                        className="flex items-center gap-2"
                    >
                        {showJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showJson ? 'Hide JSON' : 'Show JSON'}
                    </Button>
                </div>

                {/* JSON Viewer */}
                {showJson && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Form Data (JSON)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                                <pre className="text-sm">
                                    <code>{JSON.stringify({
                                        form: {
                                            id: form.id,
                                            name: form.name,
                                            slug: form.slug,
                                            description: form.description,
                                            settings: form.settings,
                                            is_active: form.is_active
                                        },
                                        currentPage: {
                                            index: currentPageIndex,
                                            id: currentPage.id,
                                            title: currentPage.title,
                                            description: currentPage.description,
                                            settings: currentPage.settings,
                                            conditionalLogic: currentPage.conditional_logic
                                        },
                                        formData: formData,
                                        progress: `${Math.round(progress)}%`
                                    }, null, 2)}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}