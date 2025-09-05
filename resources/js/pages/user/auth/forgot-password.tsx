import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { FormResponse } from '@/lib/constant';
import { forgotPassword } from '@/routes/user/auth';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

type FormData = {
    email: string;
};

export default function UserForgotPassword() {
    const { data, setData, processing, errors, post } = useForm<FormData>({
        email: '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(forgotPassword().url, FormResponse);
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500">{errors.email}</p>}
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

UserForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="Forgot Password" description="Input your email send change password link">
        {page}
    </AuthLayout>
);
