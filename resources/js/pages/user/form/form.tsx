import UserLayout from "@/layouts/user-layout";

export default function UserFormForm() {
    return (
        <div>
            <h1>User Form Form</h1>
        </div>
    )
}

UserFormForm.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;