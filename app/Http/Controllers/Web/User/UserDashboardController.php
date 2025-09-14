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
            return redirect()->route('user.dashboard.onboarding');
        }

        $user = Auth::guard('user')->user();

        // Verify the checkout session and create subscription record
        try {
            $session = $user->stripe()->checkout->sessions->retrieve($sessionId);

            if ($session->payment_status === 'paid') {
                // Create subscription record in database for admin panel
                $subscription = $user->subscriptions()->create([
                    'name' => 'default',
                    'stripe_id' => $session->subscription,
                    'stripe_status' => 'active',
                    'stripe_price' => $session->amount_total / 100, // Convert from cents
                    'quantity' => 1,
                    'trial_ends_at' => $session->trial_end ? \Carbon\Carbon::createFromTimestamp($session->trial_end) : null,
                    'ends_at' => null,
                ]);

                // Add subscription item
                $subscription->items()->create([
                    'stripe_id' => $session->subscription,
                    'stripe_product' => $session->metadata->plan_id ?? null,
                    'stripe_price' => $session->amount_total / 100,
                    'quantity' => 1,
                ]);
            }
        } catch (\Exception $e) {
            // Log error but don't fail the success page
            \Log::error('Failed to create subscription record: ' . $e->getMessage());
        }

        // Redirect to dashboard with success message
        return redirect()->route('user.dashboard.index')->with('success', 'Welcome! Your subscription has been activated successfully.');
    }

    public function subscribe()
    {
        // Keep this method for backward compatibility or remove if not needed
        return redirect()->route('user.dashboard.onboarding');
    }
}
