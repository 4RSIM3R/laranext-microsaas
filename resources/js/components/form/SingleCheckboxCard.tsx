import { Card, CardContent } from '@/components/ui/card';

interface FormField {
    id: number;
    label: string;
    name: string;
    required: boolean;
    help_text?: string;
    settings?: {
        show_label?: boolean;
    };
}

interface SingleCheckboxCardProps {
    field: FormField;
    isChecked: boolean;
    onToggle: (checked: boolean) => void;
    primaryColor: string;
    textColor: string;
}

export default function SingleCheckboxCard({ field, isChecked, onToggle, primaryColor, textColor }: SingleCheckboxCardProps) {
    return (
        <div className="space-y-4">
            <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isChecked ? 'shadow-md ring-2' : 'hover:ring-1 hover:ring-gray-300'
                }`}
                style={
                    {
                        borderColor: isChecked ? primaryColor : undefined,
                        '--tw-ring-color': isChecked ? primaryColor : undefined,
                    } as React.CSSProperties
                }
                onClick={() => onToggle(!isChecked)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                                isChecked ? 'border-current' : 'border-gray-300'
                            }`}
                            style={{
                                borderColor: isChecked ? primaryColor : undefined,
                                backgroundColor: isChecked ? primaryColor : undefined,
                            }}
                        >
                            {isChecked && (
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>
                        {field.settings?.show_label !== false && (
                            <span className="text-base font-medium sm:text-lg">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
            {field.help_text && (
                <p className="text-opacity-70 text-base sm:text-lg" style={{ color: textColor }}>
                    {field.help_text}
                </p>
            )}
        </div>
    );
}
