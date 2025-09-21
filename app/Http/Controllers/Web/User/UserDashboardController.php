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
        $plans = Plan::query()->where('is_active', true)->orderBy('sort_order')->get();
        return Inertia::render('user/onboarding', [
            'plans' => $plans,
            'stripeKey' => config('cashier.key'),
            'stripePublishableKey' => config('cashier.key'),
            'flash' => [
                'error' => session('error'),
                'error_code' => session('error_code'),
                'retry_plan_id' => session('retry_plan_id'),
            ]
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        try {
            $user = Auth::guard("user")->user();

            // Check if email is verified (if verification is required)
            if (!$user->hasVerifiedEmail() && config('auth.verification.required', false)) {
                return response()->json([
                    'error' => 'Please verify your email address before subscribing to a plan.',
                    'error_code' => 'EMAIL_NOT_VERIFIED'
                ], 403);
            }

            // Validate plan exists
            if (!$request->plan_id) {
                return response()->json([
                    'error' => 'Please select a plan to continue.',
                    'error_code' => 'PLAN_NOT_SELECTED'
                ], 400);
            }

            $plan = Plan::find($request->plan_id);
            if (!$plan) {
                return response()->json([
                    'error' => 'The selected plan is no longer available. Please refresh the page and try again.',
                    'error_code' => 'PLAN_NOT_FOUND'
                ], 404);
            }

            if (!$plan->is_active) {
                return response()->json([
                    'error' => 'The selected plan is currently unavailable. Please choose a different plan.',
                    'error_code' => 'PLAN_INACTIVE'
                ], 400);
            }

            // Check if user already has an active subscription
            if ($user->subscribed('default')) {
                return response()->json([
                    'error' => 'You already have an active subscription. Please contact support if you need to change your plan.',
                    'error_code' => 'ALREADY_SUBSCRIBED'
                ], 400);
            }

            // Validate Stripe price ID
            if (!$plan->stripe_price_id) {
                Log::error('Plan missing Stripe price ID', ['plan_id' => $plan->id]);
                return response()->json([
                    'error' => 'There is a configuration issue with this plan. Please contact support.',
                    'error_code' => 'PLAN_CONFIG_ERROR'
                ], 500);
            }

            // Create Stripe customer if not exists
            try {
                if (!$user->hasStripeId()) {
                    $user->createAsStripeCustomer();
                }
            } catch (\Exception $e) {
                Log::error('Failed to create Stripe customer', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Unable to set up your payment account. Please try again or contact support.',
                    'error_code' => 'CUSTOMER_CREATION_FAILED'
                ], 500);
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

            try {
                $checkout = $user->checkout([$plan->stripe_price_id => 1], $checkoutOptions);

                return response()->json([
                    'sessionId' => $checkout->id,
                ]);
            } catch (\Laravel\Cashier\Exceptions\IncompletePayment $e) {
                Log::error('Incomplete payment during checkout', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Payment requires additional authentication. Please try again.',
                    'error_code' => 'PAYMENT_INCOMPLETE'
                ], 400);
            } catch (\Stripe\Exception\CardException $e) {
                Log::error('Card error during checkout', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'There was an issue with your payment method. Please try a different card.',
                    'error_code' => 'CARD_ERROR'
                ], 400);
            } catch (\Stripe\Exception\RateLimitException $e) {
                Log::error('Rate limit exceeded', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Too many requests. Please wait a moment and try again.',
                    'error_code' => 'RATE_LIMIT'
                ], 429);
            } catch (\Stripe\Exception\InvalidRequestException $e) {
                Log::error('Invalid Stripe request', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'There was a configuration error. Please contact support.',
                    'error_code' => 'INVALID_REQUEST'
                ], 500);
            } catch (\Stripe\Exception\AuthenticationException $e) {
                Log::error('Stripe authentication failed', [
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Payment system authentication failed. Please contact support.',
                    'error_code' => 'AUTH_ERROR'
                ], 500);
            } catch (\Stripe\Exception\ApiConnectionException $e) {
                Log::error('Stripe API connection failed', [
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Unable to connect to payment system. Please check your internet connection and try again.',
                    'error_code' => 'CONNECTION_ERROR'
                ], 503);
            } catch (\Stripe\Exception\ApiErrorException $e) {
                Log::error('Stripe API error', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'error' => 'Payment system error. Please try again or contact support.',
                    'error_code' => 'API_ERROR'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Unexpected error in checkout session creation', [
                'user_id' => $user->id ?? null,
                'plan_id' => $request->plan_id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again or contact support if the problem persists.',
                'error_code' => 'UNEXPECTED_ERROR'
            ], 500);
        }
    }

    public function checkoutSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            Log::warning('Checkout success accessed without session ID', [
                'user_id' => Auth::guard('user')->id(),
                'request_data' => $request->all()
            ]);
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'Invalid checkout session. Please try subscribing again.')
                ->with('error_code', 'NO_SESSION_ID');
        }

        $user = Auth::guard('user')->user();

        try {
            $session = $user->stripe()->checkout->sessions->retrieve($sessionId, [
                'expand' => ['subscription', 'subscription.items.data.price']
            ]);

            if (!$session) {
                Log::error('Stripe session not found', [
                    'user_id' => $user->id,
                    'session_id' => $sessionId
                ]);
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'Checkout session not found. Please try subscribing again.')
                    ->with('error_code', 'SESSION_NOT_FOUND');
            }

            if (!$session->subscription) {
                Log::error('No subscription in Stripe session', [
                    'user_id' => $user->id,
                    'session_id' => $sessionId,
                    'session_status' => $session->status,
                    'payment_status' => $session->payment_status
                ]);
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'No subscription was created. Please try again or contact support.')
                    ->with('error_code', 'NO_SUBSCRIPTION');
            }

            $planId = $session->metadata->plan_id ?? null;
            $plan = $planId ? Plan::find($planId) : null;

            if (!$plan) {
                Log::error('Plan not found for successful checkout', [
                    'user_id' => $user->id,
                    'session_id' => $sessionId,
                    'plan_id' => $planId
                ]);
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'Plan information not found. Please contact support.')
                    ->with('error_code', 'PLAN_NOT_FOUND');
            }

            // Handle successful payment
            if ($session->payment_status === 'paid' || $session->status === 'complete') {
                try {
                    // Check if subscription already exists to avoid duplicates
                    if (!$user->subscribed('default')) {
                        // Sync the existing Stripe subscription to our database
                        $user->subscriptions()->create([
                            'type' => 'default',
                            'stripe_id' => $session->subscription->id,
                            'stripe_status' => $session->subscription->status,
                            'stripe_price' => $plan->stripe_price_id,
                            'quantity' => 1,
                            'trial_ends_at' => $session->subscription->trial_end ?
                                \Carbon\Carbon::createFromTimestamp($session->subscription->trial_end) : null,
                            'ends_at' => null,
                        ]);

                        Log::info('Subscription created successfully', [
                            'user_id' => $user->id,
                            'plan_id' => $plan->id,
                            'session_id' => $sessionId
                        ]);
                    } else {
                        Log::warning('User already has subscription during checkout success', [
                            'user_id' => $user->id,
                            'session_id' => $sessionId
                        ]);
                    }

                    return redirect()->route('user.dashboard.onboarding.success', [
                        'session_id' => $sessionId,
                        'plan_id' => $plan->id
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create subscription record', [
                        'user_id' => $user->id,
                        'plan_id' => $plan->id,
                        'session_id' => $sessionId,
                        'error' => $e->getMessage()
                    ]);
                    return redirect()->route('user.dashboard.onboarding')
                        ->with('error', 'Payment was successful but there was an issue setting up your account. Please contact support.')
                        ->with('error_code', 'SUBSCRIPTION_CREATION_FAILED');
                }
            }

            // Handle incomplete payment
            if ($session->payment_status === 'unpaid' || $session->status === 'open') {
                Log::warning('Incomplete payment in checkout success', [
                    'user_id' => $user->id,
                    'session_id' => $sessionId,
                    'payment_status' => $session->payment_status,
                    'session_status' => $session->status
                ]);
                return redirect()->route('user.dashboard.onboarding')
                    ->with('error', 'Payment was not completed. Please try again with a valid payment method.')
                    ->with('error_code', 'PAYMENT_INCOMPLETE')
                    ->with('retry_plan_id', $plan->id);
            }

            // Handle other statuses
            Log::warning('Unexpected session status in checkout success', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'payment_status' => $session->payment_status,
                'session_status' => $session->status
            ]);

            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'There was an issue processing your subscription. Please try again or contact support.')
                ->with('error_code', 'UNEXPECTED_STATUS')
                ->with('retry_plan_id', $plan->id);
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            Log::error('Invalid Stripe request in checkout success', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'Invalid session. Please try subscribing again.')
                ->with('error_code', 'INVALID_SESSION');
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe API error in checkout success', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'Payment system error. Please try again or contact support.')
                ->with('error_code', 'STRIPE_API_ERROR');
        } catch (\Exception $e) {
            Log::error('Unexpected error in checkout success', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'An unexpected error occurred. Please try again or contact support if the problem persists.')
                ->with('error_code', 'UNEXPECTED_ERROR');
        }
    }

    public function onboardingSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');
        $planId = $request->get('plan_id');

        $user = Auth::guard('user')->user();
        $plan = null;

        // Verify user has active subscription
        if (!$user->subscribed('default')) {
            return redirect()->route('user.dashboard.onboarding')
                ->with('error', 'No active subscription found.');
        }

        // Get plan details if plan_id provided
        if ($planId) {
            $plan = Plan::find($planId);
        }

        // If no plan found via ID, try to get it from subscription
        if (!$plan && $user->subscribed('default')) {
            $subscription = $user->subscription('default');
            $plan = Plan::where('stripe_price_id', $subscription->stripe_price)->first();
        }

        return Inertia::render('user/onboarding-success', [
            'sessionId' => $sessionId,
            'plan' => $plan,
            'user' => $user,
            'subscription' => $user->subscription('default')
        ]);
    }

    public function subscribe()
    {
        return redirect()->route('user.dashboard.onboarding');
    }
}
