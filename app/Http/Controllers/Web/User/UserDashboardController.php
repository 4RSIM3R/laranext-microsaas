<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubscriptionRequest;
use App\Models\Plan;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserDashboardController extends Controller
{

    public function index()
    {
        $user = Auth::guard('user')->user();
        return Inertia::render('user/dashboard', [
            'user' => $user,
        ]);
    }

    public function onboarding()
    {
        $plans = Plan::query()->orderBy('sort_order')->get();
        return Inertia::render('user/onboarding', [
            'plans' => $plans,
            'stripeKey' => config('cashier.key'),
            'stripePublishableKey' => config('cashier.key')
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        try {
            $user = Auth::guard("user")->user();
            $plan = Plan::findOrFail($request->plan_id);

            // Check if user already has an active subscription
            if ($user->subscribed('default')) {
                return response()->json([
                    'error' => 'You already have an active subscription.'
                ], 400);
            }

            // Create Stripe customer if not exists
            if (!$user->hasStripeId()) {
                $user->createAsStripeCustomer();
            }

            // Create checkout session with trial support
            $checkoutOptions = [
                'success_url' => route('user.dashboard.checkout.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('user.dashboard.onboarding'),
                'mode' => 'subscription',
                'metadata' => [
                    'plan_id' => $plan->id,
                    'user_id' => $user->id,
                ],
            ];

            // Add trial period if plan has one
            if ($plan->trial_period > 0) {
                $trialEnds = now()->add($plan->trial_interval, $plan->trial_period);
                $checkoutOptions['subscription_data'] = [
                    'trial_end' => $trialEnds->timestamp,
                ];
            }

            $checkout = $user->checkout([$plan->stripe_price_id => 1], $checkoutOptions);

            return response()->json([
                'sessionId' => $checkout->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkoutSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'Invalid checkout session.');
        }

        $user = Auth::guard('user')->user();

        try {
            // Retrieve the checkout session from Stripe
            $session = $user->stripe()->checkout->sessions->retrieve($sessionId, [
                'expand' => ['subscription', 'subscription.items.data.price']
            ]);

            // Verify the session is valid
            if (!$session || !$session->subscription) {
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'Invalid checkout session.');
            }

            // Get the plan from metadata
            $planId = $session->metadata->plan_id ?? null;
            $plan = $planId ? Plan::find($planId) : null;

            // Handle successful payment
            if ($session->payment_status === 'paid' || $session->status === 'complete') {

                // Check if subscription already exists (to prevent duplicates)
                $subscription = $user->subscription('default');

                if ($subscription) {
                    $subscription->update([
                        'stripe_id' => $session->subscription->id,
                        'stripe_status' => $session->subscription->status,
                        'stripe_price' => $session->subscription->items->data[0]->price->id,
                        'quantity' => $session->subscription->items->data[0]->quantity,
                        'trial_ends_at' => $session->subscription->trial_end ?
                            Carbon::createFromTimestamp($session->subscription->trial_end) : null,
                        'ends_at' => null,
                    ]);
                } else {
                    $user->newSubscription('default', $plan->stripe_price_id)->create($session->subscription->id);
                }

                return redirect()->route('user.dashboard.index')
                    ->with('success', 'Welcome! Your subscription has been activated successfully.');
            }

            // Handle incomplete or failed payments
            if ($session->payment_status === 'unpaid' || $session->status === 'open') {
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'Payment was not completed. Please try again.');
            }

            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'There was an issue processing your subscription. Please contact support.');
        } catch (\Exception $e) {
            dd($e);
            Log::error('Checkout session processing failed', [
                'session_id' => $sessionId,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'There was an error processing your subscription. Please try again or contact support.');
        }
    }

    public function subscribe()
    {
        return redirect()->route('user.dashboard.onboarding');
    }
}
