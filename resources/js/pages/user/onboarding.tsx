import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plan } from '@/types/plan';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    plans: Plan[];
    stripeKey: string;
    stripePublishableKey: string;
    flash?: {
        error?: string;
        error_code?: string;
        retry_plan_id?: string;
    };
};

export default function UserOnboarding({ plans, stripePublishableKey, flash }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [step, setStep] = useState<'select' | 'payment'>('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [retryPlanId, setRetryPlanId] = useState<number | null>(null);
    const [stripe, setStripe] = useState<any>(null);

    useEffect(() => {
        // Initialize Stripe
        if (stripePublishableKey) {
            loadStripe(stripePublishableKey).then(setStripe);
        }

        // Check for error messages from flash data or URL parameters
        if (flash?.error) {
            setError(flash.error);
            setErrorCode(flash.error_code || null);
            setRetryPlanId(flash.retry_plan_id ? parseInt(flash.retry_plan_id) : null);
        } else {
            // Fallback to URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const errorParam = urlParams.get('error');
            const errorCodeParam = urlParams.get('error_code');
            const retryPlanIdParam = urlParams.get('retry_plan_id');

            if (errorParam) {
                setError(errorParam);
                setErrorCode(errorCodeParam);
                setRetryPlanId(retryPlanIdParam ? parseInt(retryPlanIdParam) : null);

                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [stripePublishableKey, flash]);

    const handlePlanSelect = async (plan: Plan) => {
        setSelectedPlan(plan);
        setLoading(true);
        setError(null);
        setErrorCode(null);
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
                    setError(result.error.message || 'Payment failed. Please try again.');
                    setErrorCode('STRIPE_REDIRECT_ERROR');
                    setStep('select');
                }
            } else {
                setError('Failed to create checkout session. Please try again.');
                setErrorCode('SESSION_CREATION_FAILED');
                setStep('select');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred. Please try again.';
            const errorCode = err.response?.data?.error_code || 'UNKNOWN_ERROR';

            setError(errorMessage);
            setErrorCode(errorCode);
            setStep('select');
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
        setErrorCode(null);
        setRetryPlanId(null);
    };

    type ErrorAction = {
        label: string;
        action: () => void | Promise<void>;
        icon: React.ComponentType<any>;
        variant: 'default' | 'outline';
    };

    const getErrorActions = (): ErrorAction[] => {
        const actions: ErrorAction[] = [];

        // Retry with same plan if available
        if (retryPlanId) {
            const retryPlan = plans.find((p) => p.id === retryPlanId);
            if (retryPlan) {
                actions.push({
                    label: `Retry ${retryPlan.name}`,
                    action: () => handlePlanSelect(retryPlan),
                    icon: RefreshCw,
                    variant: 'default',
                });
            }
        }

        // Contact support for certain errors
        if (['PLAN_CONFIG_ERROR', 'AUTH_ERROR', 'SUBSCRIPTION_CREATION_FAILED'].includes(errorCode || '')) {
            actions.push({
                label: 'Contact Support',
                action: () => {
                    window.open('mailto:support@example.com', '_blank');
                },
                icon: Mail,
                variant: 'outline',
            });
        }

        // Refresh page for configuration errors
        if (['PLAN_NOT_FOUND', 'CONNECTION_ERROR'].includes(errorCode || '')) {
            actions.push({
                label: 'Refresh Page',
                action: () => window.location.reload(),
                icon: RefreshCw,
                variant: 'outline',
            });
        }

        return actions;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

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
                    <div className="mb-8">
                        <Alert className="border-destructive bg-destructive/10">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="flex flex-col space-y-3">
                                <div>
                                    <p className="font-medium text-destructive">{error}</p>
                                    {errorCode && <p className="mt-1 text-xs text-muted-foreground">Error Code: {errorCode}</p>}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {getErrorActions().map((action, index) => {
                                        const Icon = action.icon;
                                        return (
                                            <Button key={index} variant={action.variant} size="sm" onClick={action.action} className="h-8">
                                                <Icon className="mr-1 h-3 w-3" />
                                                {action.label}
                                            </Button>
                                        );
                                    })}
                                    <Button variant="ghost" size="sm" onClick={clearError} className="h-8">
                                        Dismiss
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                'relative cursor-pointer transition-all hover:shadow-lg',
                                plan.sort_order === 1 && 'ring-2 ring-primary',
                                retryPlanId === plan.id && 'bg-orange-50/50 ring-2 ring-orange-500',
                            )}
                            onClick={() => !loading && handlePlanSelect(plan)}
                        >
                            {plan.sort_order === 1 && !retryPlanId && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                                </div>
                            )}

                            {retryPlanId === plan.id && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <Badge className="bg-orange-500 text-white">Try Again</Badge>
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

                                <Button className="w-full" variant={plan.sort_order === 1 ? 'default' : 'outline'} size="lg" disabled={loading}>
                                    {loading && selectedPlan?.id === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
