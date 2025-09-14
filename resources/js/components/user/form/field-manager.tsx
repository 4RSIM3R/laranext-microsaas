import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, SettingsIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import { FormField } from '@/types/form';

const FIELD_TYPES = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Group' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'url', label: 'URL' }
];

type Props = {
    fields: FormField[];
    onAddField: (field: Omit<FormField, 'id' | 'created_at' | 'updated_at'>) => void;
    onUpdateField: (fieldId: number, updates: Partial<FormField>) => void;
    onDeleteField: (fieldId: number) => void;
};

export default function FieldManager({
    fields,
    onAddField,
    onUpdateField,
    onDeleteField
}: Props) {
    const [isAddingField, setIsAddingField] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [newField, setNewField] = useState({
        label: '',
        name: '',
        type: 'text' as FormField['type'],
        placeholder: '',
        help_text: '',
        default_value: '',
        required: false,
        validation: [] as string[],
        options: [{ value: '', label: '' }],
        settings: {
            show_label: true,
            show_placeholder: true,
            max_length: undefined as number | undefined,
            min_value: undefined as number | undefined,
            max_value: undefined as number | undefined
        },
        sort_order: fields.length + 1
    });

    const handleAddField = () => {
        if (newField.label.trim()) {
            const fieldName = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');
            const finalField = {
                ...newField,
                name: fieldName,
                options: ['select', 'radio', 'checkbox'].includes(newField.type)
                    ? newField.options.filter(opt => opt.value.trim() && opt.label.trim())
                    : undefined
            };
            onAddField(finalField);
            setNewField({
                label: '',
                name: '',
                type: 'text',
                placeholder: '',
                help_text: '',
                default_value: '',
                required: false,
                validation: [],
                options: [{ value: '', label: '' }],
                settings: {
                    show_label: true,
                    show_placeholder: true,
                    max_length: undefined,
                    min_value: undefined,
                    max_value: undefined
                },
                sort_order: fields.length + 1
            });
            setIsAddingField(false);
        }
    };

    const handleUpdateField = () => {
        if (editingField && editingField.label.trim()) {
            onUpdateField(editingField.id, editingField);
            setEditingField(null);
        }
    };

    const addOption = () => {
        setNewField(prev => ({
            ...prev,
            options: [...prev.options, { value: '', label: '' }]
        }));
    };

    const removeOption = (index: number) => {
        setNewField(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const updateOption = (index: number, field: 'value' | 'label', value: string) => {
        setNewField(prev => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, [field]: value } : opt
            )
        }));
    };

    const sortedFields = [...fields].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Fields</CardTitle>
                        <CardDescription>Add and configure form fields</CardDescription>
                    </div>
                    <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Field
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Field</DialogTitle>
                                <DialogDescription>
                                    Configure a new field for your form
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="field-label">Field Label *</Label>
                                        <Input
                                            id="field-label"
                                            value={newField.label}
                                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                            placeholder="Enter field label"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="field-name">Field Name</Label>
                                        <Input
                                            id="field-name"
                                            value={newField.name}
                                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                            placeholder="Auto-generated from label"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="field-type">Field Type</Label>
                                    <Select
                                        value={newField.type}
                                        onValueChange={(value) => setNewField({ ...newField, type: value as FormField['type'] })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select field type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FIELD_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="field-placeholder">Placeholder</Label>
                                    <Input
                                        id="field-placeholder"
                                        value={newField.placeholder}
                                        onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                        placeholder="Enter placeholder text"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="field-help">Help Text</Label>
                                    <Textarea
                                        id="field-help"
                                        value={newField.help_text}
                                        onChange={(e) => setNewField({ ...newField, help_text: e.target.value })}
                                        placeholder="Enter help text"
                                        rows={2}
                                    />
                                </div>

                                {['select', 'radio', 'checkbox'].includes(newField.type) && (
                                    <div>
                                        <Label>Options</Label>
                                        <div className="space-y-2">
                                            {newField.options.map((option, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        placeholder="Value"
                                                        value={option.value}
                                                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder="Label"
                                                        value={option.label}
                                                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                                                    />
                                                    {newField.options.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeOption(index)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addOption}
                                            >
                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {['number'].includes(newField.type) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="min-value">Minimum Value</Label>
                                            <Input
                                                id="min-value"
                                                type="number"
                                                value={newField.settings.min_value || ''}
                                                onChange={(e) => setNewField({
                                                    ...newField,
                                                    settings: {
                                                        ...newField.settings,
                                                        min_value: e.target.value ? parseInt(e.target.value) : undefined
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max-value">Maximum Value</Label>
                                            <Input
                                                id="max-value"
                                                type="number"
                                                value={newField.settings.max_value || ''}
                                                onChange={(e) => setNewField({
                                                    ...newField,
                                                    settings: {
                                                        ...newField.settings,
                                                        max_value: e.target.value ? parseInt(e.target.value) : undefined
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {['text', 'textarea'].includes(newField.type) && (
                                    <div>
                                        <Label htmlFor="max-length">Maximum Length</Label>
                                        <Input
                                            id="max-length"
                                            type="number"
                                            value={newField.settings.max_length || ''}
                                            onChange={(e) => setNewField({
                                                ...newField,
                                                settings: {
                                                    ...newField.settings,
                                                    max_length: e.target.value ? parseInt(e.target.value) : undefined
                                                }
                                            })}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="field-required"
                                            checked={newField.required}
                                            onCheckedChange={(checked) => setNewField({ ...newField, required: checked as boolean })}
                                        />
                                        <Label htmlFor="field-required">Required field</Label>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="field-default">Default Value</Label>
                                    <Input
                                        id="field-default"
                                        value={newField.default_value}
                                        onChange={(e) => setNewField({ ...newField, default_value: e.target.value })}
                                        placeholder="Enter default value"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddingField(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddField}>
                                    Add Field
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {sortedFields.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No fields yet. Add your first field to get started.
                        </p>
                    ) : (
                        sortedFields.map((field) => (
                            <div
                                key={field.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                            >
                                <div className="flex items-center space-x-3">
                                    <GripVerticalIcon className="h-4 w-4 text-gray-400 cursor-move" />
                                    <div>
                                        <h4 className="font-medium text-sm">{field.label}</h4>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                {FIELD_TYPES.find(t => t.value === field.type)?.label}
                                            </span>
                                            {field.required && (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                                    Required
                                                </span>
                                            )}
                                            <span>Field name: {field.name}</span>
                                        </div>
                                        {field.placeholder && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Placeholder: {field.placeholder}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Dialog open={editingField?.id === field.id} onOpenChange={(open) => !open && setEditingField(null)}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingField(field);
                                                }}
                                            >
                                                <SettingsIcon className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Edit Field</DialogTitle>
                                                <DialogDescription>
                                                    Update field configuration
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="edit-field-label">Field Label *</Label>
                                                        <Input
                                                            id="edit-field-label"
                                                            value={editingField?.label || ''}
                                                            onChange={(e) => setEditingField(prev =>
                                                                prev ? { ...prev, label: e.target.value } : null
                                                            )}
                                                            placeholder="Enter field label"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="edit-field-name">Field Name</Label>
                                                        <Input
                                                            id="edit-field-name"
                                                            value={editingField?.name || ''}
                                                            onChange={(e) => setEditingField(prev =>
                                                                prev ? { ...prev, name: e.target.value } : null
                                                            )}
                                                            placeholder="Auto-generated from label"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-field-type">Field Type</Label>
                                                    <Select
                                                        value={editingField?.type || 'text'}
                                                        onValueChange={(value) => setEditingField(prev =>
                                                            prev ? { ...prev, type: value as FormField['type'] } : null
                                                        )}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select field type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {FIELD_TYPES.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-field-placeholder">Placeholder</Label>
                                                    <Input
                                                        id="edit-field-placeholder"
                                                        value={editingField?.placeholder || ''}
                                                        onChange={(e) => setEditingField(prev =>
                                                            prev ? { ...prev, placeholder: e.target.value } : null
                                                        )}
                                                        placeholder="Enter placeholder text"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-field-help">Help Text</Label>
                                                    <Textarea
                                                        id="edit-field-help"
                                                        value={editingField?.help_text || ''}
                                                        onChange={(e) => setEditingField(prev =>
                                                            prev ? { ...prev, help_text: e.target.value } : null
                                                        )}
                                                        placeholder="Enter help text"
                                                        rows={2}
                                                    />
                                                </div>

                                                {['select', 'radio', 'checkbox'].includes(editingField?.type || '') && (
                                                    <div>
                                                        <Label>Options</Label>
                                                        <div className="space-y-2">
                                                            {editingField?.options?.map((option, index) => (
                                                                <div key={index} className="flex gap-2">
                                                                    <Input
                                                                        placeholder="Value"
                                                                        value={option.value}
                                                                        onChange={(e) => setEditingField(prev =>
                                                                            prev ? {
                                                                                ...prev,
                                                                                options: prev.options?.map((opt, i) =>
                                                                                    i === index ? { ...opt, value: e.target.value } : opt
                                                                                ) || []
                                                                            } : null
                                                                        )}
                                                                    />
                                                                    <Input
                                                                        placeholder="Label"
                                                                        value={option.label}
                                                                        onChange={(e) => setEditingField(prev =>
                                                                            prev ? {
                                                                                ...prev,
                                                                                options: prev.options?.map((opt, i) =>
                                                                                    i === index ? { ...opt, label: e.target.value } : opt
                                                                                ) || []
                                                                            } : null
                                                                        )}
                                                                    />
                                                                    {(editingField?.options?.length || 0) > 1 && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setEditingField(prev =>
                                                                                prev ? {
                                                                                    ...prev,
                                                                                    options: prev.options?.filter((_, i) => i !== index) || []
                                                                                } : null
                                                                            )}
                                                                        >
                                                                            <TrashIcon className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setEditingField(prev =>
                                                                    prev ? {
                                                                        ...prev,
                                                                        options: [...(prev.options || []), { value: '', label: '' }]
                                                                    } : null
                                                                )}
                                                            >
                                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                                Add Option
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {['number'].includes(editingField?.type || '') && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="edit-min-value">Minimum Value</Label>
                                                            <Input
                                                                id="edit-min-value"
                                                                type="number"
                                                                value={editingField?.settings?.min_value || ''}
                                                                onChange={(e) => setEditingField(prev =>
                                                                    prev ? {
                                                                        ...prev,
                                                                        settings: {
                                                                            ...prev.settings,
                                                                            min_value: e.target.value ? parseInt(e.target.value) : undefined
                                                                        }
                                                                    } : null
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-max-value">Maximum Value</Label>
                                                            <Input
                                                                id="edit-max-value"
                                                                type="number"
                                                                value={editingField?.settings?.max_value || ''}
                                                                onChange={(e) => setEditingField(prev =>
                                                                    prev ? {
                                                                        ...prev,
                                                                        settings: {
                                                                            ...prev.settings,
                                                                            max_value: e.target.value ? parseInt(e.target.value) : undefined
                                                                        }
                                                                    } : null
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {['text', 'textarea'].includes(editingField?.type || '') && (
                                                    <div>
                                                        <Label htmlFor="edit-max-length">Maximum Length</Label>
                                                        <Input
                                                            id="edit-max-length"
                                                            type="number"
                                                            value={editingField?.settings?.max_length || ''}
                                                            onChange={(e) => setEditingField(prev =>
                                                                prev ? {
                                                                    ...prev,
                                                                    settings: {
                                                                        ...prev.settings,
                                                                        max_length: e.target.value ? parseInt(e.target.value) : undefined
                                                                    }
                                                                } : null
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="edit-field-required"
                                                            checked={editingField?.required || false}
                                                            onCheckedChange={(checked) => setEditingField(prev =>
                                                                prev ? { ...prev, required: checked as boolean } : null
                                                            )}
                                                        />
                                                        <Label htmlFor="edit-field-required">Required field</Label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-field-default">Default Value</Label>
                                                    <Input
                                                        id="edit-field-default"
                                                        value={editingField?.default_value || ''}
                                                        onChange={(e) => setEditingField(prev =>
                                                            prev ? { ...prev, default_value: e.target.value } : null
                                                        )}
                                                        placeholder="Enter default value"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setEditingField(null)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleUpdateField}>
                                                    Save Changes
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteField(field.id)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}