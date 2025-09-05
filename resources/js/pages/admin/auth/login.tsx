import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { FormResponse } from '@/lib/constant';
import { authenticate } from '@/routes/admin/auth';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

type FormData = {
    email: string;
    password: string;
};

export default function AdminLogin() {
    const { data, setData, processing, errors, post } = useForm<FormData>({
        email: '',
        password: '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(authenticate().url, FormResponse);
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
                    <div className="grid gap-3">
                        <Input id="password" type="password" required value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full">
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Login
                    </Button>
                </div>
            </div>
        </form>
    );
}

AdminLogin.layout = (page: React.ReactNode) => (
    <AuthLayout title="Admin Login" description="Admin Console Dashboard">
        {page}
    </AuthLayout>
);
