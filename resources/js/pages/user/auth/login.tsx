import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { FormResponse } from '@/lib/constant';
import { authenticate, register } from '@/routes/user/auth';
import { Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

type FormData = {
    email: string;
    password: string;
};

export default function UserLogin() {

    const {data, setData, processing, errors, post} = useForm<FormData>({
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
                        <Input id="email" type="email" placeholder="m@example.com" required value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        {errors.email && <p className="text-red-500">{errors.email}</p>}
                    </div>
                    <div className="grid gap-3">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="" className="ml-auto text-sm underline-offset-4 hover:underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full">
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Login
                    </Button>
                </div>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href={register()} className="underline underline-offset-4">
                        Sign up
                    </Link>
                </div>
            </div>
        </form>
    );
}

UserLogin.layout = (page: React.ReactNode) => (
    <AuthLayout title="Login" description="Login to your account">
        {page}
    </AuthLayout>
);
