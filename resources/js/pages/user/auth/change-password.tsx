import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { FormResponse } from "@/lib/constant";
import { changePassword } from "@/routes/user/auth";
import { useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

type FormData = {
    password: string;
    password_confirmation: string;
};

export default function UserChangePassword() {
    const { data, setData, processing, errors, post } = useForm<FormData>({
        password: '',
        password_confirmation: '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(changePassword().url, FormResponse);
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="m@example.com"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="password">Password Confirmation</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="m@example.com"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && <p className="text-red-500">{errors.password_confirmation}</p>}
                    </div>
                    <Button type="submit" className="w-full">
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Forgot Password
                    </Button>
                </div>
            </div>
        </form>
    );
}

UserChangePassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="Change Password" description="Change Password">
        {page}
    </AuthLayout>
);