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
            'stripeKey' => config('cashier.key')
        ]);
    }

    public function subscribe(SubscriptionRequest $request)
    {
        try {
            $user = Auth::guard("user")->user();
            $plan = Plan::findOrFail($request->validated()['plan_id']);

            // Check if user already has an active subscription
            if ($user->subscribed('default')) {
                return WebResponse::response(
                    new \Exception('You already have an active subscription.'),
                    'user.dashboard.onboarding'
                );
            }

            // Create Stripe customer if not exists
            if (!$user->hasStripeId()) {
                $user->createAsStripeCustomer();
            }

            // Add payment method
            $user->addPaymentMethod($request->validated()['payment_method']);

            // Create subscription
            $subscription = $user->newSubscription('default', $plan->stripe_price_id);

            // Add trial period if plan has one
            if ($plan->trial_period > 0) {
                $trialEnds = now()->add($plan->trial_interval, $plan->trial_period);
                $subscription->trialUntil($trialEnds);

                // For trials, we still need a payment method but won't charge immediately
                $subscription->create($request->validated()['payment_method']);
            } else {
                // No trial, charge immediately
                $subscription->create($request->validated()['payment_method']);
            }

            $message = $plan->trial_period > 0
                ? "Your {$plan->trial_period} {$plan->trial_interval} free trial has started!"
                : 'Subscription created successfully!';

            return WebResponse::response(
                $message,
                'user.dashboard.index'
            );
        } catch (\Exception $e) {
            return WebResponse::response(
                $e,
                'user.dashboard.onboarding'
            );
        }
    }
}
