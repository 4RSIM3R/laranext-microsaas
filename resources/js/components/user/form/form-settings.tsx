import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/types/form';
import { useState } from 'react';

type Props = {
    form: Form;
    onUpdateForm: (updates: Partial<Form>) => void;
    onSave: () => void;
    isSaving?: boolean;
};

export default function FormSettings({ form, onUpdateForm, onSave, isSaving = false }: Props) {
    const [hasChanges, setHasChanges] = useState(false);

    const handleUpdate = (updates: Partial<Form>) => {
        onUpdateForm(updates);
        setHasChanges(true);
    };

    const handleSave = () => {
        onSave();
        setHasChanges(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Form Settings</CardTitle>
                        <CardDescription>Configure your form properties</CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="form-name">Form Name</Label>
                            <Input
                                id="form-name"
                                value={form.name}
                                onChange={(e) => handleUpdate({ name: e.target.value })}
                                placeholder="Enter form name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="form-slug">Form Slug</Label>
                            <Input
                                id="form-slug"
                                value={form.slug}
                                onChange={(e) => handleUpdate({ slug: e.target.value })}
                                placeholder="form-slug"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="form-description">Description</Label>
                        <Textarea
                            id="form-description"
                            value={form.description || ''}
                            onChange={(e) => handleUpdate({ description: e.target.value })}
                            placeholder="Enter form description"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="submission-rate">Submission Rate</Label>
                        <Input
                            id="submission-rate"
                            type="text"
                            inputMode="decimal"
                            value={form.submission_rate?.toString() || '0'}
                            onChange={(e) => handleUpdate({ submission_rate: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch checked={form.is_active} onCheckedChange={(checked) => handleUpdate({ is_active: checked })} />
                        <Label>Form is active</Label>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme Settings</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <Input
                                id="primary-color"
                                type="color"
                                value={form.settings.theme.primary_color}
                                onChange={(e) =>
                                    handleUpdate({
                                        settings: {
                                            ...form.settings,
                                            theme: {
                                                ...form.settings.theme,
                                                primary_color: e.target.value,
                                            },
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="background-color">Background Color</Label>
                            <Input
                                id="background-color"
                                type="color"
                                value={form.settings.theme.background_color}
                                onChange={(e) =>
                                    handleUpdate({
                                        settings: {
                                            ...form.settings,
                                            theme: {
                                                ...form.settings.theme,
                                                background_color: e.target.value,
                                            },
                                        },
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="text-color">Text Color</Label>
                            <Input
                                id="text-color"
                                type="color"
                                value={form.settings.theme.text_color}
                                onChange={(e) =>
                                    handleUpdate({
                                        settings: {
                                            ...form.settings,
                                            theme: {
                                                ...form.settings.theme,
                                                text_color: e.target.value,
                                            },
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="button-style">Button Style</Label>
                        <Select
                            value={form.settings.theme.button_style}
                            onValueChange={(value) =>
                                handleUpdate({
                                    settings: {
                                        ...form.settings,
                                        theme: {
                                            ...form.settings.theme,
                                            button_style: value as 'rounded' | 'pill',
                                        },
                                    },
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rounded">Rounded</SelectItem>
                                <SelectItem value="pill">Pill</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={form.settings.notifications?.email_notification || false}
                            onCheckedChange={(checked) =>
                                handleUpdate({
                                    settings: {
                                        ...form.settings,
                                        notifications: {
                                            ...form.settings.notifications,
                                            email_notification: checked,
                                        },
                                    },
                                })
                            }
                        />
                        <Label>Email notifications on submission</Label>
                    </div>
                    <div>
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                            id="webhook-url"
                            value={form.settings.notifications?.webhook_url || ''}
                            onChange={(e) =>
                                handleUpdate({
                                    settings: {
                                        ...form.settings,
                                        notifications: {
                                            ...form.settings.notifications,
                                            webhook_url: e.target.value,
                                        },
                                    },
                                })
                            }
                            placeholder="https://your-webhook-url.com"
                        />
                    </div>
                </div>

                {/* Tracking */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tracking & Analytics</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="meta-pixel">Meta Pixel ID</Label>
                            <Input
                                id="meta-pixel"
                                value={form.settings.tracking?.meta_pixel || ''}
                                onChange={(e) =>
                                    handleUpdate({
                                        settings: {
                                            ...form.settings,
                                            tracking: {
                                                ...form.settings.tracking,
                                                meta_pixel: e.target.value,
                                            },
                                        },
                                    })
                                }
                                placeholder="123456789012345"
                            />
                        </div>
                        <div>
                            <Label htmlFor="google-analytics">Google Analytics ID</Label>
                            <Input
                                id="google-analytics"
                                value={form.settings.tracking?.google_analytics || ''}
                                onChange={(e) =>
                                    handleUpdate({
                                        settings: {
                                            ...form.settings,
                                            tracking: {
                                                ...form.settings.tracking,
                                                google_analytics: e.target.value,
                                            },
                                        },
                                    })
                                }
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
