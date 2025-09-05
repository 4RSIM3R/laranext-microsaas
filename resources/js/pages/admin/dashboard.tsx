import AdminLayout from '@/layouts/admin-layout';

export default function AdminDashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>
        </div>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
