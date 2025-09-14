import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserLayout from '@/layouts/user-layout';
import { date_format } from '@/lib/format';
import forms from '@/routes/forms';
import form from '@/routes/user/form';
import { Base } from '@/types/base';
import { Form } from '@/types/form';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Plus } from 'lucide-react';
import { useCallback } from 'react';

export default function UserFormIndex() {
    const load = useCallback(async (params: Record<string, any>) => {
        const response = await axios.get<Base<Form[]>>(form.fetch().url, {
            params: params,
        });
        return response.data;
    }, []);

    const helper = createColumnHelper<Form>();

    const columns: ColumnDef<Form, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('slug', {
            id: 'slug',
            header: 'Slug',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('description', {
            id: 'description',
            header: 'Public Preview',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => (
                <Link target="_blank" href={forms.preview(row.row.original.id).url}>
                    <Button variant="outline" size="sm">
                        Preview
                    </Button>
                </Link>
            ),
        }),
        helper.display({
            id: 'created_at',
            header: 'Created At',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => date_format(row.row.original.created_at, 'dd MMM yyyy'),
        }),
        helper.display({
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            Action
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                        <Link href={form.builder(row.row.original.id).url}>
                            <DropdownMenuItem>
                                <Eye /> Builder
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">Form Management</h1>
                    <p className="text-sm text-gray-500">Manage your forms</p>
                </div>
                <div className="flex gap-2">
                    <Link href={form.create().url}>
                        <Button>
                            <Plus className="size-4" />
                            Add Form
                        </Button>
                    </Link>
                </div>
            </div>
            <NextTable<Form> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

UserFormIndex.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;
