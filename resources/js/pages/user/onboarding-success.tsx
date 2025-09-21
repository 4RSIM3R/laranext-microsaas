import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dashboard from '@/routes/user/dashboard';
import { Plan } from '@/types/plan';
import { Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    sessionId: string;
    plan: Plan | null;
    user: any;
    subscription: any;
};

export default function OnboardingSuccess({ sessionId, plan, subscription }: Props) {
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>('processing');

    useEffect(() => {
        // Show processing animation briefly for better UX
        const timer = setTimeout(() => {
            setSubscriptionStatus('active');
        }, 1500);

        return () => clearTimeout(timer);
    }, [sessionId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const isOnTrial = subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > new Date();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-6 text-center">
                        <div className="relative">
                            <CheckCircle className="h-20 w-20 text-green-500" />
                            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 animate-pulse text-yellow-500" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold">Welcome aboard! 🎉</h1>
                            <p className="text-lg text-muted-foreground">
                                {subscriptionStatus === 'processing'
                                    ? 'Setting up your subscription...'
                                    : `Your subscription to ${plan?.name || 'your selected plan'} has been activated!`}
                            </p>
                        </div>

                        {subscriptionStatus === 'processing' && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <div className="h-3 w-3 animate-pulse rounded-full bg-primary"></div>
                                <div className="h-3 w-3 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                                <div className="h-3 w-3 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}

                        {subscriptionStatus === 'active' && (
                            <div className="w-full space-y-6">
                                {/* Plan Details */}
                                {plan && (
                                    <div className="rounded-lg border bg-card p-4 text-left">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            {isOnTrial && (
                                                <Badge variant="secondary" className="border-green-200 bg-green-100 text-green-800">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    Free Trial
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">{plan.description}</p>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{isOnTrial ? 'After trial' : 'Billing'}:</span>
                                            <span className="font-medium">
                                                {formatPrice(plan.price)}/{plan.invoice_interval}
                                            </span>
                                        </div>

                                        {isOnTrial && subscription?.trial_ends_at && (
                                            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                                                <span className="text-muted-foreground">Trial ends:</span>
                                                <span className="font-medium">{new Date(subscription.trial_ends_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Success Message */}
                                <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
                                    <div className="flex items-center space-x-2">
                                        <Sparkles className="h-5 w-5" />
                                        <p className="font-medium">
                                            {isOnTrial
                                                ? `Your free trial has started! Enjoy ${plan?.trial_period || 0} ${plan?.trial_interval}${(plan?.trial_period || 0) > 1 ? 's' : ''} of full access.`
                                                : 'You now have full access to all features!'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Button onClick={() => (window.location.href = dashboard.index.url())} className="w-full" size="lg">
                                        Go to Dashboard
                                    </Button>

                                    <Button variant="outline" onClick={() => (window.location.href = dashboard.index.url())} className="w-full">
                                        Start Creating Forms
                                    </Button>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p>• Access all premium features immediately</p>
                                    <p>• Create unlimited forms and collect responses</p>
                                    <p>• Cancel anytime from your account settings</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
