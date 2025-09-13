import UserLayout from "@/layouts/user-layout";

export default function UserFormIndex() {
    return (
        <div>
            <h1>User Form Index</h1>
        </div>
    )
}

UserFormIndex.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;