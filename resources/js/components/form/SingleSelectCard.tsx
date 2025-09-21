import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Option {
    value: string;
    label: string;
}

interface FormField {
    id: number;
    label: string;
    name: string;
    required: boolean;
    help_text?: string;
    options?: Option[];
    settings?: {
        show_label?: boolean;
    };
}

interface SingleSelectCardProps {
    field: FormField;
    selectedValue: string;
    onValueChange: (value: string) => void;
    primaryColor: string;
    textColor: string;
}

export default function SingleSelectCard({ field, selectedValue, onValueChange, primaryColor, textColor }: SingleSelectCardProps) {
    return (
        <div className="space-y-4">
            {field.settings?.show_label !== false && (
                <Label className="text-lg font-medium sm:text-xl">
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {field.options
                    ?.filter((option) => option.value !== '')
                    .map((option) => {
                        const isSelected = selectedValue === option.value;
                        return (
                            <Card
                                key={option.value}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    isSelected ? 'shadow-md ring-2' : 'hover:ring-1 hover:ring-gray-300'
                                }`}
                                style={
                                    {
                                        borderColor: isSelected ? primaryColor : undefined,
                                        '--tw-ring-color': isSelected ? primaryColor : undefined,
                                    } as React.CSSProperties
                                }
                                onClick={() => onValueChange(option.value)}
                            >
                                <CardContent className="p-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div
                                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                                                isSelected ? 'border-current' : 'border-gray-300'
                                            }`}
                                            style={{
                                                borderColor: isSelected ? primaryColor : undefined,
                                                backgroundColor: isSelected ? primaryColor : undefined,
                                            }}
                                        >
                                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-base font-medium sm:text-lg">{option.label}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>
            {field.help_text && (
                <p className="text-opacity-70 text-base sm:text-lg" style={{ color: textColor }}>
                    {field.help_text}
                </p>
            )}
        </div>
    );
}
