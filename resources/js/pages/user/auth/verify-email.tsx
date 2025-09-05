import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, resendVerification } from '@/routes/user/auth';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

interface EmailVerificationProps {
    message?: string;
    error?: string;
}

export default function EmailVerification({ message, error }: EmailVerificationProps) {
    const [isResending, setIsResending] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleResendVerification = () => {
        setIsResending(true);
        post(resendVerification().url, {
            onSuccess: () => {
                setIsResending(false);
            },
            onError: () => {
                setIsResending(false);
            },
        });
    };

    return (
        <>
            <Head title="Email Verification" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Mail className="size-12" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                            <CardDescription>Check your email for a verification link, or resend the verification email.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {message && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <Button onClick={handleResendVerification} disabled={processing || isResending || !data.email} className="w-full">
                                    {(processing || isResending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                                </Button>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Already verified?{' '}
                                    <Link href={login()} className="text-blue-600 hover:text-blue-500">
                                        Go to Login
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
