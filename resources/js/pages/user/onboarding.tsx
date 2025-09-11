import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dashboard from '@/routes/user/dashboard';
import { Plan } from '@/types/plan';
import { useForm } from '@inertiajs/react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

type Props = {
    plans: Plan[];
    stripeKey: string;
};

type FormData = {
    plan_id: number;
    payment_method: string;
};

function CheckoutForm({ selectedPlan, onSuccess }: { selectedPlan: Plan; onSuccess: () => void }) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, post, errors } = useForm<FormData>({
        plan_id: selectedPlan.id,
        payment_method: '',
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError('Card element not found');
            setProcessing(false);
            return;
        }

        try {
            // Create payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (stripeError) {
                setError(stripeError.message || 'An error occurred');
                setProcessing(false);
                return;
            }

            data.payment_method = paymentMethod.id;

            // Submit to backend
            post(dashboard.subscribe.url(), {
                onSuccess: () => {
                    onSuccess();
                },
                onError: (errors) => {
                    setError(Object.values(errors).flat().join(', '));
                    setProcessing(false);
                },
            });
        } catch {
            setError('An unexpected error occurred');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium">Payment Information</label>
                    <div className="rounded-md border bg-background p-4">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: 'hsl(var(--foreground))',
                                        '::placeholder': {
                                            color: 'hsl(var(--muted-foreground))',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {error && <div className="text-sm text-destructive">{error}</div>}

                {errors.payment_method && <InputError message={errors.payment_method} />}
            </div>

            <Button type="submit" className="w-full" disabled={!stripe || processing} size="lg">
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processing
                    ? 'Processing...'
                    : selectedPlan.trial_period > 0
                      ? `Start ${selectedPlan.trial_period} ${selectedPlan.trial_interval} free trial`
                      : `Subscribe to ${selectedPlan.name} - ${formatPrice(selectedPlan.price)}/${selectedPlan.invoice_interval}`}
            </Button>
        </form>
    );
}

export default function UserOnboarding({ plans, stripeKey }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');

    // Initialize Stripe with the provided key
    const stripePromise = loadStripe(stripeKey);

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan);
        setStep('payment');
    };

    const handlePaymentSuccess = () => {
        setStep('success');
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
            <Elements stripe={stripePromise}>
                <div className="min-h-screen bg-background py-12">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-8">
                            <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
                                ← Back to plans
                            </Button>
                            <h1 className="text-3xl font-bold">Complete your subscription</h1>
                            <p className="mt-2 text-muted-foreground">You're subscribing to the {selectedPlan.name} plan</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{selectedPlan.name}</CardTitle>
                                        <CardDescription>{selectedPlan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedPlan.trial_period > 0 ? (
                                                <>
                                                    <div className="text-3xl font-bold text-green-600">
                                                        FREE
                                                        <span className="ml-2 text-base font-normal text-muted-foreground">
                                                            for {selectedPlan.trial_period} {selectedPlan.trial_interval}
                                                            {selectedPlan.trial_period > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <div className="text-lg text-muted-foreground">
                                                        Then {formatPrice(selectedPlan.price)}/{selectedPlan.invoice_interval}
                                                    </div>
                                                    <Badge variant="secondary" className="border-green-200 bg-green-100 text-green-800">
                                                        {selectedPlan.trial_period} {selectedPlan.trial_interval}
                                                        {selectedPlan.trial_period > 1 ? 's' : ''} free trial
                                                    </Badge>
                                                </>
                                            ) : (
                                                <div className="text-3xl font-bold">
                                                    {formatPrice(selectedPlan.price)}
                                                    <span className="text-base font-normal text-muted-foreground">
                                                        /{selectedPlan.invoice_interval}
                                                    </span>
                                                </div>
                                            )}

                                            {selectedPlan.features && selectedPlan.features.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Features included:</h4>
                                                    <ul className="space-y-1">
                                                        {selectedPlan.features.map((feature, index) => (
                                                            <li key={index} className="flex items-center text-sm">
                                                                <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                                                                {feature.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Details</CardTitle>
                                        <CardDescription>
                                            {selectedPlan.trial_period > 0
                                                ? `Enter your payment information to start your ${selectedPlan.trial_period} ${selectedPlan.trial_interval} free trial. You won't be charged until the trial ends.`
                                                : 'Enter your payment information to complete the subscription'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CheckoutForm selectedPlan={selectedPlan} onSuccess={handlePaymentSuccess} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </Elements>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold">Choose your plan</h1>
                    <p className="text-xl text-muted-foreground">Select the perfect plan to get started with your journey</p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn('relative cursor-pointer transition-all hover:shadow-lg', plan.sort_order === 1 && 'ring-2 ring-primary')}
                            onClick={() => handlePlanSelect(plan)}
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
                                            {plan.features.slice(0, 5).map((feature, index) => (
                                                <li key={index} className="flex items-start text-sm">
                                                    <CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                                                    <span>{feature.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button className="w-full" variant={plan.sort_order === 1 ? 'default' : 'outline'} size="lg">
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
