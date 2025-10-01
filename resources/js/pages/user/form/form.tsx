import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserLayout from '@/layouts/user-layout';
import formRoutes from '@/routes/user/form';
import { Form } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { CircleQuestionMarkIcon, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

type Props = {
    form?: Form;
};

interface FormData {
    name: string;
    slug: string;
    description: string;
    submission_rate: string;
    settings: {
        theme: {
            primary_color: string;
            background_color: string;
            text_color: string;
            button_style: 'rounded' | 'pill';
        };
        notifications: {
            email_notification: boolean;
            webhook_url: string;
        };
        tracking: {
            meta_pixel: string;
            google_analytics: string;
        };
    };
    is_active: boolean;
}

export default function UserFormForm({ form }: Props) {
    const { data, setData, post, put, errors, processing, reset } = useForm<FormData>({
        name: form?.name || '',
        slug: form?.slug || '',
        description: form?.description || '',
        submission_rate: form?.submission_rate?.toString() || '0',
        settings: {
            theme: {
                primary_color: '#3b82f6',
                background_color: '#ffffff',
                text_color: '#1f2937',
                button_style: 'rounded',
            },
            notifications: {
                email_notification: true,
                webhook_url: '',
            },
            tracking: {
                meta_pixel: '',
                google_analytics: '',
            },
        },
        is_active: form?.is_active ?? true,
    });

    useEffect(() => {
        if (form) {
            setData({
                name: form.name,
                slug: form.slug,
                description: form.description || '',
                submission_rate: form.submission_rate?.toString() || '0',
                settings: {
                    theme: form.settings.theme,
                    notifications: {
                        email_notification: form.settings.notifications?.email_notification ?? true,
                        webhook_url: form.settings.notifications?.webhook_url ?? '',
                    },
                    tracking: {
                        meta_pixel: form.settings.tracking?.meta_pixel ?? '',
                        google_analytics: form.settings.tracking?.google_analytics ?? '',
                    },
                },
                is_active: form.is_active,
            });
        }
    }, [form, setData]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form) {
            put(formRoutes.update(form.id).url, {
                onSuccess: () => {
                    reset();
                },
            });
        } else {
            post(formRoutes.store().url, {
                onSuccess: () => {
                    reset();
                },
            });
        }
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">{form ? 'Edit Form' : 'Create Form'}</h1>
                    <p className="text-sm text-gray-500">{form ? 'Update form details and features' : 'Create a new form'}</p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <CircleQuestionMarkIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to see step-by-step guidance</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                        <CardDescription>Configure the basic form details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Form Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Lead Generation Funnel"
                            />
                            <InputError message={errors?.name} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="lead-generation-funnel"
                            />
                            <InputError message={errors?.slug} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Multi-step lead generation form with conditional logic"
                                rows={3}
                            />
                            <InputError message={errors?.description} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="submission_rate">Submission Rate</Label>
                            <Input
                                id="submission_rate"
                                type="text"
                                inputMode="decimal"
                                value={data.submission_rate}
                                onChange={(e) => setData('submission_rate', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors?.submission_rate} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Theme Settings</CardTitle>
                        <CardDescription>Customize the appearance of your form.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="primary_color">Primary Color</Label>
                            <Input
                                id="primary_color"
                                type="color"
                                value={data.settings.theme.primary_color}
                                onChange={(e) => setData('settings.theme.primary_color', e.target.value)}
                            />
                            <InputError message={errors?.['settings.theme.primary_color']} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="background_color">Background Color</Label>
                            <Input
                                id="background_color"
                                type="color"
                                value={data.settings.theme.background_color}
                                onChange={(e) => setData('settings.theme.background_color', e.target.value)}
                            />
                            <InputError message={errors?.['settings.theme.background_color']} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="text_color">Text Color</Label>
                            <Input
                                id="text_color"
                                type="color"
                                value={data.settings.theme.text_color}
                                onChange={(e) => setData('settings.theme.text_color', e.target.value)}
                            />
                            <InputError message={errors?.['settings.theme.text_color']} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="button_style">Button Style</Label>
                            <select
                                id="button_style"
                                value={data.settings.theme.button_style}
                                onChange={(e) => setData('settings.theme.button_style', e.target.value as 'rounded' | 'pill')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="rounded">Rounded</option>
                                <option value="pill">Pill</option>
                            </select>
                            <InputError message={errors?.['settings.theme.button_style']} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Notification Settings</CardTitle>
                        <CardDescription>Configure how you want to receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                id="email_notification"
                                type="checkbox"
                                checked={data.settings.notifications.email_notification}
                                onChange={(e) => setData('settings.notifications.email_notification', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="email_notification">Email Notifications</Label>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="webhook_url">Webhook URL</Label>
                            <Input
                                id="webhook_url"
                                value={data.settings.notifications.webhook_url}
                                onChange={(e) => setData('settings.notifications.webhook_url', e.target.value)}
                                placeholder="https://hooks.example.com/leads"
                            />
                            <InputError message={errors?.['settings.notifications.webhook_url']} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Tracking Settings</CardTitle>
                        <CardDescription>Configure tracking and analytics integration.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="meta_pixel">Meta Pixel ID</Label>
                            <Input
                                id="meta_pixel"
                                value={data.settings.tracking.meta_pixel}
                                onChange={(e) => setData('settings.tracking.meta_pixel', e.target.value)}
                                placeholder="123456789"
                            />
                            <InputError message={errors?.['settings.tracking.meta_pixel']} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="google_analytics">Google Analytics ID</Label>
                            <Input
                                id="google_analytics"
                                value={data.settings.tracking.google_analytics}
                                onChange={(e) => setData('settings.tracking.google_analytics', e.target.value)}
                                placeholder="UA-123456789-1"
                            />
                            <InputError message={errors?.['settings.tracking.google_analytics']} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {form ? 'Update Form' : 'Create Form'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

UserFormForm.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;
