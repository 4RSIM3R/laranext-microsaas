import AuthLayout from "@/layouts/auth-layout";

export default function UserRegister() {
    return (
        <div>
            <h1>User Register</h1>
        </div>
    )
}

UserRegister.layout = (page: React.ReactNode) => (
    <AuthLayout title="User Register" description="User Register">
        {page}
    </AuthLayout>
);