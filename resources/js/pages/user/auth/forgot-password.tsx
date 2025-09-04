import AuthLayout from "@/layouts/auth-layout";

export default function UserForgotPassword() {
    return (
        <div>
            <h1>User Forgot Password</h1>
        </div>
    )
}

UserForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="User Forgot Password" description="User Forgot Password">
        {page}
    </AuthLayout>
);