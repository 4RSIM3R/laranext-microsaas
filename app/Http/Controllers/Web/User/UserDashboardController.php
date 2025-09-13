<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubscriptionRequest;
use App\Models\Plan;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserDashboardController extends Controller
{

    public function index()
    {
        return Inertia::render('user/dashboard');
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
            return redirect()->route('user.dashboard.onboarding');
        }

        // Verify the checkout session and handle success
        return Inertia::render('user/onboarding-success', [
            'sessionId' => $sessionId
        ]);
    }

    public function subscribe()
    {
        // Keep this method for backward compatibility or remove if not needed
        return redirect()->route('user.dashboard.onboarding');
    }
}
