export interface FormField {
    id: number;
    label: string;
    name: string;
    type: 'text' | 'email' | 'number' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'url';
    placeholder?: string;
    help_text?: string;
    default_value?: string;
    required: boolean;
    validation?: string[];
    options?: Array<{ value: string; label: string }>;
    conditions?: Array<{
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
        value: string | number;
    }>;
    settings?: {
        show_label?: boolean;
        show_placeholder?: boolean;
        max_length?: number;
        min_value?: number;
        max_value?: number;
    };
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface FormPage {
    id: number;
    form_id: number;
    title: string;
    description?: string;
    sort_order: number;
    conditions?: Array<{
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
        value: string | number;
        next_page_id?: number;
    }>;
    settings?: {
        progress_bar?: boolean;
        auto_advance?: boolean;
        button_text?: string;
    };
    fields?: FormField[];
    created_at?: string;
    updated_at?: string;
}

export interface FormSettings {
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

export interface Form {
    id: number;
    name: string;
    slug: string;
    description?: string;
    settings: FormSettings;
    is_active: boolean;
    user_id: number;
    pages?: FormPage[];
    created_at?: string;
    updated_at?: string;
}

export interface FormSubmission {
    id: number;
    form_id: number;
    data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    submitted_at: string;
}

export interface FormAnalytics {
    total_views: number;
    total_submissions: number;
    conversion_rate: number;
    page_views: Array<{
        page_id: number;
        views: number;
        dropoffs: number;
    }>;
    field_completions: Array<{
        field_id: number;
        completions: number;
    }>;
}