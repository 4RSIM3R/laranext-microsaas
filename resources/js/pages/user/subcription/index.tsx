import UserLayout from "@/layouts/user-layout";

export default function UserSubcription() {
    return (
        <div>
            <h1>User Subcription</h1>
        </div>
    )
}

UserSubcription.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;