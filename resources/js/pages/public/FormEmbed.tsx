import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import EmbedLayout from '@/layouts/embed-layout';
import submissions from '@/routes/submissions';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
    next_page_offset?: number;
}

interface ConditionalLogic {
    rules: ConditionalRule[];
    default_next_page_offset?: number | null;
}

interface FormPage {
    id: number;
    title: string;
    description?: string;
    sort_order: number;
    conditional_logic?: ConditionalLogic;
    settings?: Record<string, any>;
    fields: FormField[];
}

interface Form {
    id: number;
    name: string;
    slug: string;
    description?: string;
    settings?: {
        theme?: {
            primary_color?: string;
            background_color?: string;
            text_color?: string;
            button_style?: string;
        };
        notifications?: {
            email_notification?: boolean;
            webhook_url?: string;
        };
        tracking?: {
            meta_pixel?: string;
            google_analytics?: string;
        };
    };
    is_active: boolean;
    pages: FormPage[];
}

interface FormEmbedProps {
    form: Form;
}

export default function FormEmbed({ form }: FormEmbedProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

    const currentPage = form.pages[currentPageIndex];
    const totalPages = form.pages.length;
    const progressPercentage = ((currentPageIndex + 1) / totalPages) * 100;

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateCurrentPage = () => {
        const newErrors: Record<string, string> = {};

        currentPage.fields.forEach((field) => {
            const value = formData[field.name];

            // Check required fields
            if (field.required) {
                if (field.type === 'checkbox' && field.options && field.options.length > 1) {
                    // For multiple checkboxes, at least one must be selected
                    if (!value || (Array.isArray(value) && value.length === 0)) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else if (field.type === 'checkbox') {
                    // For single checkbox, it must be checked
                    if (!value) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else {
                    // For other fields, value must not be empty
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                }
            }

            // Email validation
            if (value && field.validation) {
                field.validation.forEach((rule) => {
                    if (rule === 'email' && value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            newErrors[field.name] = 'Please enter a valid email address';
                        }
                    }
                });
            }

            // Phone validation
            if (field.type === 'phone' && value) {
                const phoneRegex = /^[\d\s\-+()]+$/;
                if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
                    newErrors[field.name] = 'Please enter a valid phone number';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const evaluateCondition = (rule: ConditionalRule): boolean => {
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
                return fieldValue && fieldValue.toString().includes(rule.value.toString());
            case 'not_contains':
                return !fieldValue || !fieldValue.toString().includes(rule.value.toString());
            default:
                return false;
        }
    };

    const getNextPageIndex = (): number | null => {
        if (!currentPage.conditional_logic) {
            // Default linear progression
            return currentPageIndex < totalPages - 1 ? currentPageIndex + 1 : null;
        }

        const logic = currentPage.conditional_logic;

        // Check conditional rules first
        if (logic.rules && logic.rules.length > 0) {
            for (const rule of logic.rules) {
                if (evaluateCondition(rule)) {
                    // Use offset-based navigation
                    if (rule.next_page_offset !== undefined) {
                        const targetIndex = currentPageIndex + rule.next_page_offset;
                        if (targetIndex < totalPages) {
                            return targetIndex;
                        }
                        // If offset leads beyond pages, end the form
                        return null;
                    }
                }
            }
        }

        // Check for default_next_page_offset
        if (logic.default_next_page_offset !== undefined && logic.default_next_page_offset !== null) {
            const targetIndex = currentPageIndex + logic.default_next_page_offset;
            if (targetIndex >= 0 && targetIndex < totalPages) {
                return targetIndex;
            }
            // If offset leads to invalid index, end the form
            return null;
        }

        // Default to linear progression
        return currentPageIndex < totalPages - 1 ? currentPageIndex + 1 : null;
    };

    const handleNext = () => {
        if (!validateCurrentPage()) {
            return;
        }

        const nextIndex = getNextPageIndex();

        if (nextIndex !== null && nextIndex >= 0) {
            // Add current page to navigation history
            setNavigationHistory((prev) => [...prev, currentPageIndex]);
            setCurrentPageIndex(nextIndex);
        } else {
            // End of form - submit
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

    const handleSubmit = async () => {
        if (!validateCurrentPage()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post(submissions.submit().url, {
                form_id: form.id,
                data: formData,
            });

            setIsSubmitted(true);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'An error occurred while submitting the form. Please try again.' });
            }
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
            className: field.settings?.show_label !== false ? 'mt-1' : '',
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
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <Input type={field.type} {...commonProps} />
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <Textarea {...commonProps} rows={4} maxLength={field.settings?.max_length} />
                        {field.settings?.max_length && (
                            <p className="text-right text-xs text-muted-foreground">
                                {(formData[field.name] || '').length}/{field.settings.max_length}
                            </p>
                        )}
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <Select value={formData[field.name] || ''} onValueChange={(value) => handleFieldChange(field.name, value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option, index) => (
                                    <SelectItem key={index} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-3">
                        {field.settings?.show_label !== false && (
                            <Label>
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <RadioGroup value={formData[field.name] || ''} onValueChange={(value) => handleFieldChange(field.name, value)}>
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`${field.name}-${index}`} />
                                    <Label htmlFor={`${field.name}-${index}`}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-3">
                        {field.settings?.show_label !== false && (
                            <Label>
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <div className="space-y-2">
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.name}-${index}`}
                                        checked={(formData[field.name] || []).includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            const currentValues = formData[field.name] || [];
                                            let newValues;

                                            if (checked) {
                                                newValues = [...currentValues, option.value];
                                            } else {
                                                newValues = currentValues.filter((v: string) => v !== option.value);
                                            }

                                            handleFieldChange(field.name, newValues);
                                        }}
                                    />
                                    <Label htmlFor={`${field.name}-${index}`}>{option.label}</Label>
                                </div>
                            ))}
                        </div>
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'password':
                return (
                    <div key={field.id} className="space-y-2">
                        {field.settings?.show_label !== false && (
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                        )}
                        <div className="relative">
                            <Input type={showPassword[field.name] ? 'text' : 'password'} {...commonProps} className="pr-10" />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() =>
                                    setShowPassword((prev) => ({
                                        ...prev,
                                        [field.name]: !prev[field.name],
                                    }))
                                }
                            >
                                {showPassword[field.name] ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                            </button>
                        </div>
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        {errors[field.name] && (
                            <p className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (isSubmitted) {
        return (
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">Thank you!</h2>
                            <p className="text-gray-600">Your form has been submitted successfully.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const theme = form.settings?.theme;
    const primaryColor = theme?.primary_color || '#3b82f6';
    const backgroundColor = theme?.background_color || '#ffffff';
    const textColor = theme?.text_color || '#1f2937';

    return (
        <div className="mx-auto max-w-2xl" style={{ backgroundColor, color: textColor }}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{currentPage.title}</CardTitle>
                            {currentPage.description && <CardDescription>{currentPage.description}</CardDescription>}
                        </div>
                        {totalPages > 1 && currentPage.settings?.progress_bar !== false && (
                            <Badge variant="outline">
                                {currentPageIndex + 1} of {totalPages}
                            </Badge>
                        )}
                    </div>
                    {totalPages > 1 && currentPage.settings?.progress_bar !== false && (
                        <div className="space-y-2">
                            <Progress value={progressPercentage} className="w-full" />
                            <p className="text-center text-sm text-muted-foreground">{Math.round(progressPercentage)}% complete</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentPage.fields.map(renderField)}

                    {errors.general && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {errors.general}
                            </p>
                        </div>
                    )}

                    <Separator />

                    <div className="flex justify-between">
                        {navigationHistory.length > 1 ? (
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                                Previous
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={isSubmitting}
                            style={{ backgroundColor: primaryColor }}
                            className="text-white hover:opacity-90"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                currentPage.settings?.button_text || 'Continue'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

FormEmbed.layout = (page: React.ReactNode) => <EmbedLayout>{page}</EmbedLayout>;
