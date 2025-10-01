import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FieldManager from '@/components/user/form/field-manager';
import FormSettings from '@/components/user/form/form-settings';
import PageManager from '@/components/user/form/page-manager';
import publicFormRoutes from '@/routes/forms/public';
import routes from '@/routes/user';
import { Form, FormField, FormPage } from '@/types/form';
import { router } from '@inertiajs/react';
import { ArrowLeftIcon, EyeIcon, SaveIcon, ShareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    form?: Form;
};

export default function UserFormBuilder({ form: initialForm }: Props) {
    const [selectedPageId, setSelectedPageId] = useState<number | undefined>();
    const [activeTab, setActiveTab] = useState('builder');
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: initialForm?.id || 0,
        name: initialForm?.name || '',
        slug: initialForm?.slug || '',
        description: initialForm?.description || '',
        submission_rate: initialForm?.submission_rate || 0,
        settings: initialForm?.settings || {
            theme: {
                primary_color: '#3b82f6',
                background_color: '#ffffff',
                text_color: '#374151',
                button_style: 'rounded' as const,
            },
            notifications: {
                email_notification: false,
                webhook_url: '',
            },
            tracking: {
                meta_pixel: '',
                google_analytics: '',
            },
        },
        is_active: initialForm?.is_active ?? true,
        user_id: initialForm?.user_id || 0,
        pages: initialForm?.pages || [],
    });

    useEffect(() => {
        if (formData.pages && formData.pages.length > 0 && !selectedPageId) {
            setSelectedPageId(formData.pages[0].id);
        }
    }, [formData.pages, selectedPageId]);

    const handleAddPage = (pageData: Omit<FormPage, 'id' | 'form_id' | 'created_at' | 'updated_at'>) => {
        const newPage: FormPage = {
            ...pageData,
            id: Date.now(),
            form_id: formData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            fields: [],
            conditional_logic: pageData.conditional_logic || {
                default_next_page_offset: null,
                rules: [],
            },
        };

        const currentPages = formData.pages || [];
        setFormData({ ...formData, pages: [...currentPages, newPage] });
        setSelectedPageId(newPage.id);
    };

    const handleUpdatePage = (pageId: number, updates: Partial<FormPage>) => {
        const currentPages = formData.pages || [];
        const updatedPages = currentPages.map((page) => (page.id === pageId ? { ...page, ...updates } : page));
        setFormData({ ...formData, pages: updatedPages });
    };

    const handleDeletePage = (pageId: number) => {
        const currentPages = formData.pages || [];
        const updatedPages = currentPages.filter((page) => page.id !== pageId);
        setFormData({ ...formData, pages: updatedPages });

        if (selectedPageId === pageId) {
            setSelectedPageId(updatedPages.length > 0 ? updatedPages[0].id : undefined);
        }
    };

    const handleAddField = (fieldData: Omit<FormField, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedPageId) return;

        const newField: FormField = {
            ...fieldData,
            id: Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const currentPages = formData.pages || [];
        const updatedPages = currentPages.map((page) =>
            page.id === selectedPageId
                ? {
                      ...page,
                      fields: [...(page.fields || []), newField],
                  }
                : page,
        );
        setFormData({ ...formData, pages: updatedPages });
    };

    const handleUpdateField = (fieldId: number, updates: Partial<FormField>) => {
        if (!selectedPageId) return;

        const currentPages = formData.pages || [];
        const updatedPages = currentPages.map((page) => {
            if (page.id === selectedPageId) {
                const currentFields = page.fields || [];
                const updatedFields = currentFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field));
                return { ...page, fields: updatedFields };
            }
            return page;
        });
        setFormData({ ...formData, pages: updatedPages });
    };

    const handleDeleteField = (fieldId: number) => {
        if (!selectedPageId) return;

        const currentPages = formData.pages || [];
        const updatedPages = currentPages.map((page) => {
            if (page.id === selectedPageId) {
                const currentFields = page.fields || [];
                const updatedFields = currentFields.filter((field) => field.id !== fieldId);
                return { ...page, fields: updatedFields };
            }
            return page;
        });
        setFormData({ ...formData, pages: updatedPages });
    };

    const handleUpdateForm = (updates: Partial<Form>) => {
        setFormData({ ...formData, ...updates });
    };

    const handleSave = () => {
        setIsSaving(true);

        if (formData.id === 0) {
            router.post(routes.form.store().url, formData as any, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    // Form was created successfully
                },
            });
        } else {
            router.put(routes.form.update(formData.id).url, formData as any, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    // Form was updated successfully
                },
            });
        }
    };

    const selectedPage = formData.pages?.find((page) => page.id === selectedPageId);

    return (
        <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.visit(routes.dashboard.index().url)}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-semibold">{formData.name || 'Untitled Form'}</h1>
                    </div>
                    <p className="ml-11 text-sm text-gray-500">{formData.description || 'Create your form by adding pages and fields'}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (formData.id && formData.id !== 0 && formData.slug) {
                                const previewUrl = publicFormRoutes.show(formData.slug).url;
                                window.open(previewUrl, '_blank');
                            }
                        }}
                        disabled={!formData.id || formData.id === 0 || !formData.slug}
                    >
                        <EyeIcon className="mr-1 h-4 w-4" />
                        Preview
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (formData.id && formData.id !== 0 && formData.slug) {
                                const shareUrl = `${window.location.origin}${publicFormRoutes.show(formData.slug).url}`;
                                navigator.clipboard
                                    .writeText(shareUrl)
                                    .then(() => {
                                        alert('Form link copied to clipboard!');
                                    })
                                    .catch(() => {
                                        prompt('Copy this form link:', shareUrl);
                                    });
                            }
                        }}
                        disabled={!formData.id || formData.id === 0 || !formData.slug}
                    >
                        <ShareIcon className="mr-1 h-4 w-4" />
                        Share
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <SaveIcon className="mr-1 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Page Manager */}
                        <div className="col-span-4">
                            <PageManager
                                pages={formData.pages || []}
                                selectedPageId={selectedPageId}
                                onAddPage={handleAddPage}
                                onUpdatePage={handleUpdatePage}
                                onDeletePage={handleDeletePage}
                                onSelectPage={setSelectedPageId}
                            />
                        </div>

                        {/* Field Manager */}
                        <div className="col-span-8">
                            {selectedPage ? (
                                <FieldManager
                                    fields={selectedPage.fields || []}
                                    onAddField={handleAddField}
                                    onUpdateField={handleUpdateField}
                                    onDeleteField={handleDeleteField}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="flex h-64 items-center justify-center">
                                        <div className="text-center">
                                            <p className="mb-4 text-gray-500">Select a page to add fields</p>
                                            <Button
                                                onClick={() =>
                                                    handleAddPage({
                                                        title: 'Page 1',
                                                        description: '',
                                                        sort_order: 1,
                                                        conditional_logic: {
                                                            default_next_page_offset: null,
                                                            rules: [],
                                                        },
                                                        settings: {
                                                            progress_bar: true,
                                                            auto_advance: false,
                                                            button_text: 'Next',
                                                        },
                                                    })
                                                }
                                            >
                                                Create First Page
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <FormSettings form={formData as Form} onUpdateForm={handleUpdateForm} onSave={handleSave} isSaving={isSaving} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
