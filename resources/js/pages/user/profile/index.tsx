import UserLayout from "@/layouts/user-layout";

export default function UserProfile() {
    return (
        <div>
            <h1>User Profile</h1>
        </div>
    )
}

UserProfile.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;