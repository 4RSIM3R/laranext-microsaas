import AdminLayout from '@/layouts/admin-layout';

export default function UserIndex() {
    return <div>UserIndex</div>;
}

UserIndex.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
