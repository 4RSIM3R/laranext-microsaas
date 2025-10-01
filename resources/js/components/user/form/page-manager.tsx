import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormPage } from '@/types/form';
import { ChevronRightIcon, PlusIcon, SettingsIcon, TrashIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    pages: FormPage[];
    selectedPageId?: number;
    onAddPage: (page: Omit<FormPage, 'id' | 'form_id' | 'created_at' | 'updated_at'>) => void;
    onUpdatePage: (pageId: number, updates: Partial<FormPage>) => void;
    onDeletePage: (pageId: number) => void;
    onSelectPage: (pageId: number) => void;
};

export default function PageManager({ pages, selectedPageId, onAddPage, onUpdatePage, onDeletePage, onSelectPage }: Props) {
    const [isAddingPage, setIsAddingPage] = useState(false);
    const [newPage, setNewPage] = useState({
        title: '',
        description: '',
        sort_order: pages.length + 1,
        conditional_logic: {
            default_next_page_offset: null,
            rules: [],
        },
        settings: {
            progress_bar: true,
            auto_advance: false,
            button_text: 'Next',
        },
    });

    const [editingPage, setEditingPage] = useState<FormPage | null>(null);

    const handleAddPage = () => {
        if (newPage.title.trim()) {
            onAddPage(newPage);
            setNewPage({
                title: '',
                description: '',
                sort_order: pages.length + 1,
                conditional_logic: {
                    default_next_page_offset: null,
                    rules: [],
                },
                settings: {
                    progress_bar: true,
                    auto_advance: false,
                    button_text: 'Next',
                },
            });
            setIsAddingPage(false);
        }
    };

    const handleUpdatePage = () => {
        if (editingPage && editingPage.title.trim()) {
            onUpdatePage(editingPage.id, editingPage);
            setEditingPage(null);
        }
    };

    const sortedPages = [...pages].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Pages</CardTitle>
                        <CardDescription>Add and manage form pages</CardDescription>
                    </div>
                    <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <PlusIcon className="mr-1 h-4 w-4" />
                                Add Page
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex max-h-[90vh] flex-col">
                            <DialogHeader>
                                <DialogTitle>Add New Page</DialogTitle>
                                <DialogDescription>Create a new page for your form</DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                <div>
                                    <Label htmlFor="page-title">Page Title</Label>
                                    <Input
                                        id="page-title"
                                        value={newPage.title}
                                        onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                                        placeholder="Enter page title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="page-description">Description</Label>
                                    <Textarea
                                        id="page-description"
                                        value={newPage.description}
                                        onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                                        placeholder="Enter page description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddingPage(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddPage}>Add Page</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {sortedPages.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">No pages yet. Add your first page to get started.</p>
                    ) : (
                        sortedPages.map((page, index) => (
                            <div
                                key={page.id}
                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                                    selectedPageId === page.id ? 'border-blue-200 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => onSelectPage(page.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">{page.title}</h4>
                                        {page.description && <p className="mt-1 text-xs text-gray-500">{page.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Dialog open={editingPage?.id === page.id} onOpenChange={(open) => !open && setEditingPage(null)}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingPage({
                                                        ...page,
                                                        conditional_logic: page.conditional_logic || {
                                                            default_next_page_offset: null,
                                                            rules: [],
                                                        },
                                                        settings: page.settings || {
                                                            progress_bar: true,
                                                            auto_advance: false,
                                                            button_text: 'Next',
                                                        },
                                                    });
                                                }}
                                            >
                                                <SettingsIcon className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="flex max-h-[90vh] flex-col">
                                            <DialogHeader>
                                                <DialogTitle>Edit Page Settings</DialogTitle>
                                                <DialogDescription>Configure page properties and behavior</DialogDescription>
                                            </DialogHeader>
                                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                                <div>
                                                    <Label htmlFor="edit-title">Page Title</Label>
                                                    <Input
                                                        id="edit-title"
                                                        value={editingPage?.title || ''}
                                                        onChange={(e) => setEditingPage((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="edit-description">Description</Label>
                                                    <Textarea
                                                        id="edit-description"
                                                        value={editingPage?.description || ''}
                                                        onChange={(e) =>
                                                            setEditingPage((prev) => (prev ? { ...prev, description: e.target.value } : null))
                                                        }
                                                        rows={3}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="edit-button-text">Button Text</Label>
                                                    <Input
                                                        id="edit-button-text"
                                                        value={editingPage?.settings?.button_text || 'Next'}
                                                        onChange={(e) =>
                                                            setEditingPage((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          settings: {
                                                                              ...prev.settings,
                                                                              button_text: e.target.value,
                                                                          },
                                                                      }
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Show Progress Bar</Label>
                                                        <p className="text-xs text-gray-500">Display progress indicator</p>
                                                    </div>
                                                    <Switch
                                                        checked={editingPage?.settings?.progress_bar || false}
                                                        onCheckedChange={(checked) =>
                                                            setEditingPage((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          settings: {
                                                                              ...prev.settings,
                                                                              progress_bar: checked,
                                                                          },
                                                                      }
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Auto Advance</Label>
                                                        <p className="text-xs text-gray-500">Automatically go to next page</p>
                                                    </div>
                                                    <Switch
                                                        checked={editingPage?.settings?.auto_advance || false}
                                                        onCheckedChange={(checked) =>
                                                            setEditingPage((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          settings: {
                                                                              ...prev.settings,
                                                                              auto_advance: checked,
                                                                          },
                                                                      }
                                                                    : null,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-4 border-t pt-4">
                                                    <div>
                                                        <Label>Conditional Logic</Label>
                                                        <p className="text-xs text-gray-500">Configure rules for page navigation</p>
                                                    </div>

                                                    {/* Conditional Rules */}
                                                    <div>
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <Label className="text-sm font-medium">Rules</Label>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newRule = {
                                                                        field: '',
                                                                        operator: 'equals' as const,
                                                                        value: '',
                                                                        next_page_offset: 1,
                                                                    };
                                                                    setEditingPage((prev) => {
                                                                        if (!prev) return null;

                                                                        const currentConditionalLogic = prev.conditional_logic || {
                                                                            default_next_page_offset: null,
                                                                            rules: [],
                                                                        };

                                                                        return {
                                                                            ...prev,
                                                                            conditional_logic: {
                                                                                default_next_page_offset:
                                                                                    currentConditionalLogic.default_next_page_offset,
                                                                                rules: [...(currentConditionalLogic.rules || []), newRule],
                                                                            },
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                <PlusIcon className="mr-1 h-4 w-4" />
                                                                Add Rule
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {editingPage?.conditional_logic?.rules?.map((rule, index) => (
                                                                <div key={index} className="space-y-3 rounded-lg border p-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium">Rule {index + 1}</span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setEditingPage((prev) =>
                                                                                    prev
                                                                                        ? {
                                                                                              ...prev,
                                                                                              conditional_logic: {
                                                                                                  ...prev.conditional_logic,
                                                                                                  rules:
                                                                                                      prev.conditional_logic?.rules?.filter(
                                                                                                          (_, i) => i !== index,
                                                                                                      ) || [],
                                                                                              },
                                                                                          }
                                                                                        : null,
                                                                                )
                                                                            }
                                                                        >
                                                                            <XIcon className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div>
                                                                            <Label className="text-xs">Field Name</Label>
                                                                            <Input
                                                                                value={rule.field}
                                                                                onChange={(e) =>
                                                                                    setEditingPage((prev) =>
                                                                                        prev
                                                                                            ? {
                                                                                                  ...prev,
                                                                                                  conditional_logic: {
                                                                                                      ...prev.conditional_logic,
                                                                                                      rules:
                                                                                                          prev.conditional_logic?.rules?.map(
                                                                                                              (r, i) =>
                                                                                                                  i === index
                                                                                                                      ? {
                                                                                                                            ...r,
                                                                                                                            field: e.target.value,
                                                                                                                        }
                                                                                                                      : r,
                                                                                                          ) || [],
                                                                                                  },
                                                                                              }
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                                placeholder="e.g., age_group"
                                                                                className="h-8 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Operator</Label>
                                                                            <Select
                                                                                value={rule.operator}
                                                                                onValueChange={(value) =>
                                                                                    setEditingPage((prev) =>
                                                                                        prev
                                                                                            ? {
                                                                                                  ...prev,
                                                                                                  conditional_logic: {
                                                                                                      ...prev.conditional_logic,
                                                                                                      rules:
                                                                                                          prev.conditional_logic?.rules?.map(
                                                                                                              (r, i) =>
                                                                                                                  i === index
                                                                                                                      ? {
                                                                                                                            ...r,
                                                                                                                            operator: value as any,
                                                                                                                        }
                                                                                                                      : r,
                                                                                                          ) || [],
                                                                                                  },
                                                                                              }
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="h-8 text-sm">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="equals">Equals</SelectItem>
                                                                                    <SelectItem value="not_equals">Not Equals</SelectItem>
                                                                                    <SelectItem value="contains">Contains</SelectItem>
                                                                                    <SelectItem value="greater_than">Greater Than</SelectItem>
                                                                                    <SelectItem value="less_than">Less Than</SelectItem>
                                                                                    <SelectItem value="in">In</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Value</Label>
                                                                            <Input
                                                                                value={rule.value}
                                                                                onChange={(e) =>
                                                                                    setEditingPage((prev) =>
                                                                                        prev
                                                                                            ? {
                                                                                                  ...prev,
                                                                                                  conditional_logic: {
                                                                                                      ...prev.conditional_logic,
                                                                                                      rules:
                                                                                                          prev.conditional_logic?.rules?.map(
                                                                                                              (r, i) =>
                                                                                                                  i === index
                                                                                                                      ? {
                                                                                                                            ...r,
                                                                                                                            value: e.target.value,
                                                                                                                        }
                                                                                                                      : r,
                                                                                                          ) || [],
                                                                                                  },
                                                                                              }
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                                placeholder="e.g., under_17"
                                                                                className="h-8 text-sm"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs">Next Page Offset</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={rule.next_page_offset ?? ''}
                                                                            onChange={(e) =>
                                                                                setEditingPage((prev) =>
                                                                                    prev
                                                                                        ? {
                                                                                              ...prev,
                                                                                              conditional_logic: {
                                                                                                  ...prev.conditional_logic,
                                                                                                  rules:
                                                                                                      prev.conditional_logic?.rules?.map((r, i) =>
                                                                                                          i === index
                                                                                                              ? {
                                                                                                                    ...r,
                                                                                                                    next_page_offset: e.target.value
                                                                                                                        ? parseInt(e.target.value)
                                                                                                                        : undefined,
                                                                                                                }
                                                                                                              : r,
                                                                                                      ) || [],
                                                                                              },
                                                                                          }
                                                                                        : null,
                                                                                )
                                                                            }
                                                                            placeholder="1 = next page, 2 = page after next"
                                                                            className="h-8 text-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Default Next Page Offset */}
                                                    <div>
                                                        <Label htmlFor="default-next-page-offset">Default Next Page Offset</Label>
                                                        <Input
                                                            id="default-next-page-offset"
                                                            type="number"
                                                            value={editingPage?.conditional_logic?.default_next_page_offset ?? ''}
                                                            onChange={(e) =>
                                                                setEditingPage((prev) =>
                                                                    prev
                                                                        ? {
                                                                              ...prev,
                                                                              conditional_logic: {
                                                                                  ...prev.conditional_logic,
                                                                                  default_next_page_offset: e.target.value
                                                                                      ? parseInt(e.target.value)
                                                                                      : null,
                                                                              },
                                                                          }
                                                                        : null,
                                                                )
                                                            }
                                                            placeholder="1 = next page, 2 = page after next, null = final page"
                                                            className="text-sm"
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Leave null for final page, or specify how many pages to skip ahead
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setEditingPage(null)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleUpdatePage}>Save Changes</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePage(page.id);
                                        }}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
