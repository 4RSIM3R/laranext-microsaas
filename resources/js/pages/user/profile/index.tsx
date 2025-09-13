import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserLayout from '@/layouts/user-layout';
import { FormResponse } from '@/lib/constant';
import profile from '@/routes/user/profile';
import { User } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { Loader2, Save, Shield } from 'lucide-react';
import React from 'react';

interface ProfileFormData {
    name: string;
    email: string;
}

interface PasswordFormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

type Props = {
    user: User;
};

export default function UserProfile({ user }: Props) {
    // Profile form using useForm
    const profileForm = useForm<ProfileFormData>({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm<PasswordFormData>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(profile.update.url(), FormResponse);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post(profile.updatePassword.url(), FormResponse);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and password</p>
            </div>

            {(profileForm.hasErrors || passwordForm.hasErrors) && (
                <Alert variant="destructive">
                    <AlertDescription>{Object.values({ ...profileForm.errors, ...passwordForm.errors })[0]}</AlertDescription>
                </Alert>
            )}

            {(profileForm.recentlySuccessful || passwordForm.recentlySuccessful) && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>
                        {profileForm.recentlySuccessful ? 'Profile updated successfully' : 'Password updated successfully'}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Profile Information</span>
                        </CardTitle>
                        <CardDescription>Update your name and email address</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                />
                                {profileForm.errors.name && <p className="text-sm text-red-500">{profileForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                />
                                {profileForm.errors.email && <p className="text-sm text-red-500">{profileForm.errors.email}</p>}
                            </div>
                            <Button type="submit" disabled={profileForm.processing}>
                                {profileForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Update Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="size-4" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    required
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="text-sm text-red-500">{passwordForm.errors.current_password}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    required
                                    minLength={8}
                                />
                                {passwordForm.errors.password && <p className="text-sm text-red-500">{passwordForm.errors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    required
                                    minLength={8}
                                />
                                {passwordForm.errors.password_confirmation && (
                                    <p className="text-sm text-red-500">{passwordForm.errors.password_confirmation}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={passwordForm.processing}>
                                {passwordForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

UserProfile.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;
