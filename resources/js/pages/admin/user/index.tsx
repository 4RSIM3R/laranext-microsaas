import NextTable from '@/components/next-table';
import AdminLayout from '@/layouts/admin-layout';

export default function UserIndex() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">User Management</h1>
                    <p className="text-sm text-gray-500">Manage your registered users</p>
                </div>
            </div>
            <NextTable<User> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

UserIndex.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
