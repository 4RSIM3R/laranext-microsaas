import UserLayout from "@/layouts/user-layout";

export default function UserSettingForm() {
    return (
        <div>
            <h1>User Setting Form</h1>
        </div>
    )
}

UserSettingForm.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;