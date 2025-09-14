import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FieldManager from '@/components/user/form/field-manager';
import FormSettings from '@/components/user/form/form-settings';
import PageManager from '@/components/user/form/page-manager';
import { Form, FormField, FormPage } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { EyeIcon, SaveIcon, ShareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import routes from '@/routes/user';

type Props = {
    form?: Form;
};

export default function UserFormBuilder({ form: initialForm }: Props) {
    const [selectedPageId, setSelectedPageId] = useState<number | undefined>();
    const [activeTab, setActiveTab] = useState('builder');
    const [isSaving, setIsSaving] = useState(false);

    const formRequest = useForm('form', {
        id: initialForm?.id || 0,
        name: initialForm?.name || '',
        slug: initialForm?.slug || '',
        description: initialForm?.description || '',
        settings: initialForm?.settings || {
            theme: {
                primary_color: '#3b82f6',
                background_color: '#ffffff',
                text_color: '#374151',
                button_style: 'rounded',
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
        if (formRequest.data.pages && formRequest.data.pages.length > 0 && !selectedPageId) {
            setSelectedPageId(formRequest.data.pages[0].id);
        }
    }, [formRequest.data.pages, selectedPageId]);

    const handleAddPage = (pageData: Omit<FormPage, 'id' | 'form_id' | 'created_at' | 'updated_at'>) => {
        const newPage: FormPage = {
            ...pageData,
            id: Date.now(), // Temporary ID
            form_id: formRequest.data.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            fields: [],
            conditional_logic: pageData.conditional_logic || {
                default_next_page_offset: null,
                rules: [],
            },
        };

        const currentPages = formRequest.data.pages || [];
        formRequest.setData('pages', [...currentPages, newPage]);
        setSelectedPageId(newPage.id);
    };

    const handleUpdatePage = (pageId: number, updates: Partial<FormPage>) => {
        const currentPages = formRequest.data.pages || [];
        const updatedPages = currentPages.map((page) => (page.id === pageId ? { ...page, ...updates } : page));
        formRequest.setData('pages', updatedPages);
    };

    const handleDeletePage = (pageId: number) => {
        const currentPages = formRequest.data.pages || [];
        const updatedPages = currentPages.filter((page) => page.id !== pageId);
        formRequest.setData('pages', updatedPages);

        if (selectedPageId === pageId) {
            setSelectedPageId(updatedPages.length > 0 ? updatedPages[0].id : undefined);
        }
    };

    const handleAddField = (fieldData: Omit<FormField, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedPageId) return;

        const newField: FormField = {
            ...fieldData,
            id: Date.now(), // Temporary ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const currentPages = formRequest.data.pages || [];
        const updatedPages = currentPages.map((page) =>
            page.id === selectedPageId
                ? {
                      ...page,
                      fields: [...(page.fields || []), newField],
                  }
                : page,
        );
        formRequest.setData('pages', updatedPages);
    };

    const handleUpdateField = (fieldId: number, updates: Partial<FormField>) => {
        if (!selectedPageId) return;

        const currentPages = formRequest.data.pages || [];
        const updatedPages = currentPages.map((page) => {
            if (page.id === selectedPageId) {
                const currentFields = page.fields || [];
                const updatedFields = currentFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field));
                return { ...page, fields: updatedFields };
            }
            return page;
        });
        formRequest.setData('pages', updatedPages);
    };

    const handleDeleteField = (fieldId: number) => {
        if (!selectedPageId) return;

        const currentPages = formRequest.data.pages || [];
        const updatedPages = currentPages.map((page) => {
            if (page.id === selectedPageId) {
                const currentFields = page.fields || [];
                const updatedFields = currentFields.filter((field) => field.id !== fieldId);
                return { ...page, fields: updatedFields };
            }
            return page;
        });
        formRequest.setData('pages', updatedPages);
    };

    const handleUpdateForm = (updates: Partial<Form>) => {
        Object.keys(updates).forEach((key) => {
            const formKey = key as keyof Form;
            if (formKey !== 'created_at' && formKey !== 'updated_at') {
                formRequest.setData(formKey, updates[formKey]);
            }
        });
    };

    const handleSave = () => {
        setIsSaving(true);

        if (formRequest.data.id === 0) {
            // Create new form
            formRequest.post(routes.form.store().url, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    // Form was created successfully
                },
            });
        } else {
            // Update existing form
            formRequest.put(routes.form.update(formRequest.data.id).url, {
                onFinish: () => setIsSaving(false),
                onSuccess: () => {
                    // Form was updated successfully
                },
            });
        }
    };

    const selectedPage = formRequest.data.pages?.find((page) => page.id === selectedPageId);

    return (
        <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-semibold">{formRequest.data.name || 'Untitled Form'}</h1>
                    <p className="text-sm text-gray-500">{formRequest.data.description || 'Create your form by adding pages and fields'}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const previewUrl = formRequest.data.id && formRequest.data.id !== 0 ? `/forms/${formRequest.data.slug || formRequest.data.id}/preview` : '#';
                            if (previewUrl !== '#') {
                                window.open(previewUrl, '_blank');
                            }
                        }}
                    >
                        <EyeIcon className="mr-1 h-4 w-4" />
                        Preview
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (formRequest.data.id && formRequest.data.id !== 0) {
                                const shareUrl = `${window.location.origin}/forms/${formRequest.data.slug || formRequest.data.id}`;
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
                                pages={formRequest.data.pages || []}
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
                    <FormSettings form={formRequest.data as Form} onUpdateForm={handleUpdateForm} onSave={handleSave} isSaving={isSaving} />
                </TabsContent>
            </Tabs>
        </div>
    );
}