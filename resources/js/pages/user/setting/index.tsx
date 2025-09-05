import UserLayout from "@/layouts/user-layout";

export default function UserSettingIndex() {
    return (
        <div>
            <h1>User Setting Index</h1>
        </div>
    );
}

UserSettingIndex.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;