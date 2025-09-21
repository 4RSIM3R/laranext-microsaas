import NextTable from '@/components/next-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import formRoutes from '@/routes/user/form';
import { Form } from '@/types/form';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SubmissionData {
    id: number;
    submitted_at: string;
    ip_address: string;
    status: string;
    [key: string]: any; // Dynamic form fields
}

interface SubmissionColumn {
    key: string;
    label: string;
    type: string;
    sortable: boolean;
    field_id?: number;
}

interface SubmissionsResponse {
    items: SubmissionData[];
    columns: SubmissionColumn[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    total_page: number;
}

interface SubmissionsTableProps {
    form: Form;
}

export default function SubmissionsTable({ form }: SubmissionsTableProps) {
    const [dynamicColumns, setDynamicColumns] = useState<ColumnDef<SubmissionData>[]>([]);
    const [isLoadingColumns, setIsLoadingColumns] = useState(true);

    const formatCellValue = useCallback((value: any, type: string) => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">—</span>;
        }

        switch (type) {
            case 'datetime':
                return new Date(value).toLocaleString();
            case 'email':
                return (
                    <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
                        {value}
                    </a>
                );
            case 'url':
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {value}
                    </a>
                );
            case 'phone':
                return (
                    <a href={`tel:${value}`} className="text-blue-600 hover:underline">
                        {value}
                    </a>
                );
            case 'checkbox':
                if (Array.isArray(value)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    );
                }
                return value ? (
                    <Badge variant="default" className="text-xs">
                        Yes
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        No
                    </Badge>
                );
            case 'select':
            case 'radio':
                return (
                    <Badge variant="outline" className="text-xs">
                        {value}
                    </Badge>
                );
            default:
                if (typeof value === 'string' && value.length > 50) {
                    return (
                        <div className="max-w-xs">
                            <span className="block truncate" title={value}>
                                {value}
                            </span>
                        </div>
                    );
                }
                return value;
        }
    }, []);

    // Load initial data to get column structure
    useEffect(() => {
        const loadColumns = async () => {
            try {
                const response = await axios.get<SubmissionsResponse>(formRoutes.submissions(form.id).url, {
                    params: { page: 1, perPage: 1 },
                });

                const columns: ColumnDef<SubmissionData>[] = [
                    {
                        id: 'id',
                        accessorKey: 'id',
                        header: 'ID',
                        cell: ({ row }) => <div className="font-medium">#{row.getValue('id')}</div>,
                        size: 80,
                    },
                    {
                        id: 'submitted_at',
                        accessorKey: 'submitted_at',
                        header: 'Submitted At',
                        cell: ({ row }) => formatCellValue(row.getValue('submitted_at'), 'datetime'),
                        size: 180,
                    },
                ];

                // Add dynamic columns for form fields
                response.data.columns
                    .filter((col) => !['id', 'submitted_at', 'ip_address', 'status'].includes(col.key))
                    .forEach((col) => {
                        columns.push({
                            id: col.key,
                            accessorKey: col.key,
                            header: col.label,
                            cell: ({ row }) => formatCellValue(row.getValue(col.key), col.type),
                            size: col.type === 'textarea' ? 200 : 150,
                        });
                    });

                // Add remaining static columns
                columns.push(
                    {
                        id: 'ip_address',
                        accessorKey: 'ip_address',
                        header: 'IP Address',
                        cell: ({ row }) => <code className="rounded bg-muted px-2 py-1 text-xs">{row.getValue('ip_address') || '—'}</code>,
                        size: 120,
                    },
                    {
                        id: 'status',
                        accessorKey: 'status',
                        header: 'Status',
                        cell: ({ row }) => {
                            const status = row.getValue('status') as string;
                            return <Badge variant={status === 'completed' ? 'default' : 'secondary'}>{status || 'completed'}</Badge>;
                        },
                        size: 100,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        cell: ({ row }) => (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // TODO: Implement view submission details
                                        console.log('View submission:', row.original);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        ),
                        enableSorting: false,
                        size: 80,
                    },
                );

                setDynamicColumns(columns);
            } catch (error) {
                console.error('Error loading columns:', error);
            } finally {
                setIsLoadingColumns(false);
            }
        };

        loadColumns();
    }, [form.id, formatCellValue]);

    const loadSubmissions = useCallback(
        async (params: Record<string, unknown>) => {
            const response = await axios.get<SubmissionsResponse>(formRoutes.submissions(form.id).url, {
                params,
            });
            return response.data;
        },
        [form.id],
    );

    const handleExport = useCallback(
        (data: SubmissionData[]) => {
            // Convert data to CSV
            if (data.length === 0) return;

            const headers = Object.keys(data[0]).filter((key) => key !== 'actions');
            const csvContent = [
                headers.join(','),
                ...data.map((row) =>
                    headers
                        .map((header) => {
                            const value = row[header];
                            if (Array.isArray(value)) {
                                return `"${value.join('; ')}"`;
                            }
                            if (typeof value === 'string' && value.includes(',')) {
                                return `"${value}"`;
                            }
                            return value || '';
                        })
                        .join(','),
                ),
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${form.slug}-submissions.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        [form.slug],
    );

    if (isLoadingColumns) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Form Submissions</h3>
                        <p className="text-sm text-muted-foreground">Loading submissions...</p>
                    </div>
                </div>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Form Submissions</h3>
                    <p className="text-sm text-muted-foreground">All submissions received for this form</p>
                </div>
            </div>

            <NextTable<SubmissionData>
                load={loadSubmissions}
                id="id"
                columns={dynamicColumns}
                enableSearch={true}
                searchPlaceholder="Search submissions..."
                enableExport={true}
                onExport={handleExport}
            />
        </div>
    );
}
