import AdminLayout from "@/layouts/admin-layout";

export default function PlanForm() {
    return (
        <div>
            <h1>Plan Form</h1>
        </div>
    );
}

PlanForm.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;