import UserLayout from "@/layouts/user-layout";

export default function UserFormBuilder() {
    return (
        <div>
            <h1>User Form Builder</h1>
        </div>
    )
}

UserFormBuilder.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;