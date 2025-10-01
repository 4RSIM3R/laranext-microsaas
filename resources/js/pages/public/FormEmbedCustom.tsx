import EmbedLayout from '@/layouts/embed-layout';
import submissions from '@/routes/submissions';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../../../css/form-embed-custom.css';

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

interface FormEmbedCustomProps {
    form: Form;
}

export default function FormEmbedCustom({ form }: FormEmbedCustomProps) {
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

    // Load custom CSS if provided via query parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const customCssUrl = urlParams.get('css');

        if (customCssUrl) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = customCssUrl;
            link.id = 'custom-form-styles';
            document.head.appendChild(link);

            return () => {
                const existingLink = document.getElementById('custom-form-styles');
                if (existingLink) {
                    existingLink.remove();
                }
            };
        }
    }, []);

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));

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

            if (field.required) {
                if (field.type === 'checkbox' && field.options && field.options.length > 1) {
                    if (!value || (Array.isArray(value) && value.length === 0)) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else if (field.type === 'checkbox') {
                    if (!value) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                } else {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                }
            }

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
            return currentPageIndex < totalPages - 1 ? currentPageIndex + 1 : null;
        }

        const logic = currentPage.conditional_logic;

        if (logic.rules && logic.rules.length > 0) {
            for (const rule of logic.rules) {
                if (evaluateCondition(rule)) {
                    if (rule.next_page_offset !== undefined) {
                        const targetIndex = currentPageIndex + rule.next_page_offset;
                        if (targetIndex < totalPages) {
                            return targetIndex;
                        }
                        return null;
                    }
                }
            }
        }

        if (logic.default_next_page_offset !== undefined && logic.default_next_page_offset !== null) {
            const targetIndex = currentPageIndex + logic.default_next_page_offset;
            if (targetIndex >= 0 && targetIndex < totalPages) {
                return targetIndex;
            }
            return null;
        }

        return currentPageIndex < totalPages - 1 ? currentPageIndex + 1 : null;
    };

    const handleNext = () => {
        if (!validateCurrentPage()) {
            return;
        }

        const nextIndex = getNextPageIndex();

        if (nextIndex !== null && nextIndex >= 0) {
            setNavigationHistory((prev) => [...prev, currentPageIndex]);
            setCurrentPageIndex(nextIndex);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (navigationHistory.length > 1) {
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
        const fieldId = `form-field-${field.name}`;
        const labelId = `form-label-${field.name}`;
        const helpId = `form-help-${field.name}`;
        const errorId = `form-error-${field.name}`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'phone':
            case 'url':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label htmlFor={fieldId} id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <input
                            type={field.type}
                            id={fieldId}
                            name={field.name}
                            value={formData[field.name] ?? field.default_value ?? ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="form-input"
                            aria-labelledby={labelId}
                            aria-describedby={field.help_text ? helpId : undefined}
                            aria-invalid={errors[field.name] ? 'true' : 'false'}
                        />
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label htmlFor={fieldId} id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <textarea
                            id={fieldId}
                            name={field.name}
                            value={formData[field.name] ?? field.default_value ?? ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={4}
                            maxLength={field.settings?.max_length}
                            className="form-textarea"
                            aria-labelledby={labelId}
                            aria-describedby={field.help_text ? helpId : undefined}
                            aria-invalid={errors[field.name] ? 'true' : 'false'}
                        />
                        {field.settings?.max_length && (
                            <p className="form-char-count">
                                {(formData[field.name] || '').length}/{field.settings.max_length}
                            </p>
                        )}
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label htmlFor={fieldId} id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <select
                            id={fieldId}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            required={field.required}
                            className="form-select"
                            aria-labelledby={labelId}
                            aria-describedby={field.help_text ? helpId : undefined}
                            aria-invalid={errors[field.name] ? 'true' : 'false'}
                        >
                            <option value="">{field.placeholder || `Select ${field.label}`}</option>
                            {field.options?.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <div className="form-radio-group" role="radiogroup" aria-labelledby={labelId}>
                            {field.options?.map((option, index) => (
                                <div key={index} className="form-radio-item">
                                    <input
                                        type="radio"
                                        id={`${fieldId}-${index}`}
                                        name={field.name}
                                        value={option.value}
                                        checked={formData[field.name] === option.value}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        required={field.required}
                                        className="form-radio-input"
                                    />
                                    <label htmlFor={`${fieldId}-${index}`} className="form-radio-label">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <div className="form-checkbox-group">
                            {field.options?.map((option, index) => (
                                <div key={index} className="form-checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`${fieldId}-${index}`}
                                        name={field.name}
                                        value={option.value}
                                        checked={(formData[field.name] || []).includes(option.value)}
                                        onChange={(e) => {
                                            const currentValues = formData[field.name] || [];
                                            let newValues;

                                            if (e.target.checked) {
                                                newValues = [...currentValues, option.value];
                                            } else {
                                                newValues = currentValues.filter((v: string) => v !== option.value);
                                            }

                                            handleFieldChange(field.name, newValues);
                                        }}
                                        className="form-checkbox-input"
                                    />
                                    <label htmlFor={`${fieldId}-${index}`} className="form-checkbox-label">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                );

            case 'password':
                return (
                    <div key={field.id} id={`form-group-${field.name}`} className="form-group">
                        {field.settings?.show_label !== false && (
                            <label htmlFor={fieldId} id={labelId} className="form-label">
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
                        )}
                        <div className="form-password-wrapper">
                            <input
                                type={showPassword[field.name] ? 'text' : 'password'}
                                id={fieldId}
                                name={field.name}
                                value={formData[field.name] ?? field.default_value ?? ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="form-input form-password-input"
                                aria-labelledby={labelId}
                                aria-describedby={field.help_text ? helpId : undefined}
                                aria-invalid={errors[field.name] ? 'true' : 'false'}
                            />
                            <button
                                type="button"
                                className="form-password-toggle"
                                onClick={() =>
                                    setShowPassword((prev) => ({
                                        ...prev,
                                        [field.name]: !prev[field.name],
                                    }))
                                }
                                aria-label={showPassword[field.name] ? 'Hide password' : 'Show password'}
                            >
                                {showPassword[field.name] ? <EyeOff className="form-icon" /> : <Eye className="form-icon" />}
                            </button>
                        </div>
                        {field.help_text && (
                            <p id={helpId} className="form-help">
                                {field.help_text}
                            </p>
                        )}
                        {errors[field.name] && (
                            <p id={errorId} className="form-error" role="alert">
                                <AlertCircle className="form-error-icon" />
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
            <div id="form-container" className="form-container">
                <div id="form-success" className="form-success">
                    <div className="form-success-icon">
                        <svg className="form-icon-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 id="form-success-title" className="form-success-title">
                        Thank you!
                    </h2>
                    <p id="form-success-message" className="form-success-message">
                        Your form has been submitted successfully.
                    </p>
                </div>
            </div>
        );
    }

    const theme = form.settings?.theme;
    const primaryColor = theme?.primary_color || '#3b82f6';

    return (
        <div id="form-container" className="form-container">
            <div id="form-card" className="form-card">
                <div id="form-header" className="form-header">
                    <div className="form-header-content">
                        <h1 id="form-page-title" className="form-page-title">
                            {currentPage.title}
                        </h1>
                        {currentPage.description && (
                            <p id="form-page-description" className="form-page-description">
                                {currentPage.description}
                            </p>
                        )}
                    </div>
                    {totalPages > 1 && currentPage.settings?.progress_bar !== false && (
                        <div id="form-progress-badge" className="form-progress-badge">
                            {currentPageIndex + 1} of {totalPages}
                        </div>
                    )}
                </div>

                {totalPages > 1 && currentPage.settings?.progress_bar !== false && (
                    <div id="form-progress-container" className="form-progress-container">
                        <div id="form-progress-bar" className="form-progress-bar" style={{ width: `${progressPercentage}%` }} />
                        <p id="form-progress-text" className="form-progress-text">
                            {Math.round(progressPercentage)}% complete
                        </p>
                    </div>
                )}

                <div id="form-body" className="form-body">
                    {currentPage.fields.map(renderField)}

                    {errors.general && (
                        <div id="form-general-error" className="form-general-error" role="alert">
                            <AlertCircle className="form-error-icon" />
                            {errors.general}
                        </div>
                    )}
                </div>

                <div id="form-footer" className="form-footer">
                    {navigationHistory.length > 1 ? (
                        <button
                            type="button"
                            id="form-btn-previous"
                            className="form-btn form-btn-secondary"
                            onClick={handlePrevious}
                            disabled={isSubmitting}
                        >
                            Previous
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <button
                        type="button"
                        id="form-btn-next"
                        className="form-btn form-btn-primary"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        style={{ backgroundColor: primaryColor }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="form-spinner" />
                                Submitting...
                            </>
                        ) : (
                            currentPage.settings?.button_text || 'Continue'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

FormEmbedCustom.layout = (page: React.ReactNode) => <EmbedLayout>{page}</EmbedLayout>;
