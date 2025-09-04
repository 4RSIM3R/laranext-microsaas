import AuthLayout from "@/layouts/auth-layout";

export default function UserChangePassword() {
    return (
        <div>
            <h1>User Change Password</h1>
        </div>
    )
}

UserChangePassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="User Change Password" description="User Change Password">
        {page}
    </AuthLayout>
);