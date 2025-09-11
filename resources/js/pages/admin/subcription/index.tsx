import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/layouts/admin-layout';
import { date_format } from '@/lib/format';
import subcription from '@/routes/admin/subcription';
import { Base } from '@/types/base';
import { Subscription } from '@/types/subcription';
import { Link } from '@inertiajs/react';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export default function SubcriptionIndex() {
    const load = useCallback(async (params: Record<string, any>) => {
        const response = await axios.get<Base<Subscription[]>>(subcription.fetch().url, {
            params: params,
        });
        return response.data;
    }, []);

    const helper = createColumnHelper<Subscription>();

    const columns: ColumnDef<Subscription, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('user.name', {
            id: 'user_name',
            header: 'User Name',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('user.email', {
            id: 'user_email',
            header: 'User Email',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('type', {
            id: 'type',
            header: 'Type',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('stripe_status', {
            id: 'stripe_status',
            header: 'Status',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => (
                <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                        row.getValue() === 'active'
                            ? 'bg-green-100 text-green-800'
                            : row.getValue() === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : row.getValue() === 'past_due'
                                ? 'bg-yellow-100 text-yellow-800'
                                : row.getValue() === 'trialing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {row.getValue() as string}
                </span>
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
                        <Link href={subcription.show(row.row.original.id).url}>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Detail
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
                    <h1 className="text-xl font-semibold">Subscription Management</h1>
                    <p className="text-sm text-gray-500">Manage user subscriptions and track transactions</p>
                </div>
            </div>
            <NextTable<Subscription> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

SubcriptionIndex.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
