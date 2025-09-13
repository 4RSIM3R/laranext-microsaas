import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dashboard from '@/routes/user/dashboard';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    sessionId: string;
};

export default function OnboardingSuccess({ sessionId }: Props) {
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>('processing');
    const [planName, setPlanName] = useState<string>('');

    useEffect(() => {
        // Here you could verify the session status with your backend
        // For now, we'll simulate the subscription being active
        const timer = setTimeout(() => {
            setSubscriptionStatus('active');
            // You could fetch the actual plan details here
            setPlanName('Your Selected Plan');
        }, 2000);

        return () => clearTimeout(timer);
    }, [sessionId]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Welcome aboard! 🎉</h1>
                            <p className="text-muted-foreground">
                                {subscriptionStatus === 'processing'
                                    ? 'Setting up your subscription...'
                                    : `Your subscription to ${planName} has been activated!`
                                }
                            </p>
                        </div>

                        {subscriptionStatus === 'processing' && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}

                        {subscriptionStatus === 'active' && (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
                                    <p className="text-sm font-medium">
                                        ✨ You now have full access to all features!
                                    </p>
                                </div>

                                <Button
                                    onClick={() => (window.location.href = dashboard.index.url())}
                                    className="w-full"
                                    size="lg"
                                >
                                    Go to Dashboard
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => (window.location.href = dashboard.index.url())}
                                    className="w-full"
                                >
                                    View Your Forms
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}