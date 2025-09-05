import AdminLayout from "@/layouts/admin-layout";

export default function SettingIndex() {
    return (
        <div>
            <h1>SettingIndex</h1>
        </div>
    );
}

SettingIndex.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;