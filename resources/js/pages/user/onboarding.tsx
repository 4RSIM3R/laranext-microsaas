import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dashboard from '@/routes/user/dashboard';
import { Plan } from '@/types/plan';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type Props = {
    plans: Plan[];
    stripeKey: string;
    stripePublishableKey: string;
};

export default function UserOnboarding({ plans, stripePublishableKey }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stripe, setStripe] = useState<any>(null);

    useEffect(() => {
        // Initialize Stripe
        if (stripePublishableKey) {
            loadStripe(stripePublishableKey).then(setStripe);
        }
    }, [stripePublishableKey]);

    const handlePlanSelect = async (plan: Plan) => {
        setSelectedPlan(plan);
        setLoading(true);
        setError(null);
        setStep('payment');

        try {
            // Create checkout session
            const response = await axios.post('/dashboard/create-checkout-session', {
                plan_id: plan.id,
            });

            if (response.data.sessionId && stripe) {
                // Redirect to Stripe Checkout
                const result = await stripe.redirectToCheckout({
                    sessionId: response.data.sessionId,
                });

                if (result.error) {
                    setError(result.error.message);
                    setStep('select');
                }
            } else {
                setError('Failed to create checkout session');
                setStep('select');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred');
            setStep('select');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (step === 'success') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <div>
                                <h2 className="text-xl font-semibold">Welcome aboard!</h2>
                                <p className="text-muted-foreground">
                                    {selectedPlan?.trial_period && selectedPlan.trial_period > 0
                                        ? `Your ${selectedPlan.trial_period} ${selectedPlan.trial_interval} free trial for ${selectedPlan.name} has started!`
                                        : `Your subscription to ${selectedPlan?.name} has been activated.`}
                                </p>
                            </div>
                            <Button onClick={() => (window.location.href = dashboard.index.url())}>Go to Dashboard</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 'payment' && selectedPlan) {
        return (
            <div className="min-h-screen bg-background py-12">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="mb-8">
                        <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
                            ← Back to plans
                        </Button>
                        <h1 className="text-3xl font-bold">Processing your subscription</h1>
                        <p className="mt-2 text-muted-foreground">Redirecting to secure payment...</p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg text-muted-foreground">Please wait while we redirect you to Stripe...</p>
                        {error && (
                            <div className="text-center">
                                <p className="text-sm text-destructive">{error}</p>
                                <Button variant="outline" onClick={() => setStep('select')} className="mt-2">
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold">Choose your plan</h1>
                    <p className="text-xl text-muted-foreground">Select the perfect plan to get started with your journey</p>
                </div>

                {error && (
                    <div className="mb-8 text-center">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn('relative cursor-pointer transition-all hover:shadow-lg', plan.sort_order === 1 && 'ring-2 ring-primary')}
                            onClick={() => !loading && handlePlanSelect(plan)}
                        >
                            {plan.sort_order === 1 && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    {plan.trial_period > 0 ? (
                                        <>
                                            <div className="text-3xl font-bold text-green-600">
                                                FREE
                                                <span className="ml-1 text-lg font-normal text-muted-foreground">
                                                    {plan.trial_period} {plan.trial_interval}
                                                    {plan.trial_period > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Then {formatPrice(plan.price)}/{plan.invoice_interval}
                                            </div>
                                            <Badge variant="secondary" className="border-green-200 bg-green-100 text-green-800">
                                                {plan.trial_period} {plan.trial_interval}
                                                {plan.trial_period > 1 ? 's' : ''} free trial
                                            </Badge>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold">
                                            {formatPrice(plan.price)}
                                            <span className="text-base font-normal text-muted-foreground">/{plan.invoice_interval}</span>
                                        </div>
                                    )}
                                </div>

                                {plan.features && plan.features.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium">What's included:</h4>
                                        <ul className="space-y-2">
                                            {plan.features.slice(0, 5).map((feature: any, index: number) => (
                                                <li key={index} className="flex items-start text-sm">
                                                    <CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                                                    <span>{feature.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    variant={plan.sort_order === 1 ? 'default' : 'outline'}
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading && selectedPlan?.id === plan.id && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Get Started
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 space-y-2 text-center">
                    <p className="text-sm text-muted-foreground">All plans include a 30-day money-back guarantee. Cancel anytime.</p>
                    <p className="text-xs text-muted-foreground">
                        Free trials automatically convert to paid subscriptions. You can cancel during your trial period to avoid charges.
                    </p>
                </div>
            </div>
        </div>
    );
}