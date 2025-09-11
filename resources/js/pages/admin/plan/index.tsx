import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/layouts/admin-layout';
import { date_format } from '@/lib/format';
import plan from '@/routes/admin/plan';
import { Base } from '@/types/base';
import { Plan } from '@/types/plan';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Plus } from 'lucide-react';
import { useCallback } from 'react';

export default function PlanIndex() {
    const load = useCallback(async (params: Record<string, any>) => {
        const response = await axios.get<Base<Plan[]>>(plan.fetch().url, {
            params: params,
        });
        return response.data;
    }, []);

    const helper = createColumnHelper<Plan>();

    const columns: ColumnDef<Plan, any>[] = [
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
        helper.accessor('price', {
            id: 'price',
            header: 'Price',
            enableColumnFilter: false,
            enableHiding: false,
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
                        <Link href={plan.show(row.row.original.id).url}>
                            <DropdownMenuItem>
                                <Eye /> Detail
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
                    <h1 className="text-xl font-semibold">User Management</h1>
                    <p className="text-sm text-gray-500">Manage your registered users</p>
                </div>
                <div className="flex gap-2">
                    <Link href={plan.create().url}>
                        <Button>
                            <Plus className="size-4" />
                            Add Plan
                        </Button>
                    </Link>
                </div>
            </div>
            <NextTable<Plan> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

PlanIndex.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
