import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { FormResponse } from '@/lib/constant';
import { login, store } from '@/routes/user/auth';
import { Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

type FormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function UserRegister() {
    const { data, setData, processing, errors, post } = useForm<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(store().url, FormResponse);
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-red-500">{errors.name}</p>}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                        />
                        {errors.email && <p className="text-red-500">{errors.email}</p>}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" autoComplete="new-password" required value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="password_confirmation">Password Confirmation</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <p className="text-red-500">{errors.password_confirmation}</p>}
                    </div>
                    <Button type="submit" className="w-full">
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Register
                    </Button>
                </div>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href={login()} className="underline underline-offset-4">
                        Sign up
                    </Link>
                </div>
            </div>
        </form>
    );
}

UserRegister.layout = (page: React.ReactNode) => (
    <AuthLayout title="User Register" description="User Register">
        {page}
    </AuthLayout>
);
