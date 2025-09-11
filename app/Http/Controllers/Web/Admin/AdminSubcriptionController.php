<?php

namespace App\Http\Controllers\Web\Admin;

use App\Contract\Operational\SubcriptionContract;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Cashier\Subscription;

class AdminSubcriptionController extends Controller
{
    protected SubcriptionContract $subscriptionService;

    public function __construct(SubcriptionContract $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function index()
    {
        return Inertia::render('admin/subcription/index');
    }

    public function fetch(Request $request)
    {
        try {
            $subscriptions = Subscription::with(['user:id,name,email', 'items'])
                ->when($request->search, function ($query, $search) {
                    $query->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('stripe_id', 'like', "%{$search}%");
                })
                ->when($request->status, function ($query, $status) {
                    $query->where('stripe_status', $status);
                })
                ->when($request->type, function ($query, $type) {
                    $query->where('type', $type);
                })
                ->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 15);

            return WebResponse::success('Subscriptions retrieved successfully', $subscriptions);
        } catch (\Exception $e) {
            return WebResponse::error('Failed to fetch subscriptions: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $subscription = Subscription::with(['user:id,name,email', 'items'])
                ->findOrFail($id);

            return Inertia::render('admin/subcription/show', [
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.subcription.index')
                ->with('error', 'Subscription not found');
        }
    }

    public function stats()
    {
        try {
            $stats = [
                'total_subscriptions' => Subscription::count(),
                'active_subscriptions' => Subscription::where('stripe_status', 'active')->count(),
                'canceled_subscriptions' => Subscription::where('stripe_status', 'canceled')->count(),
                'past_due_subscriptions' => Subscription::where('stripe_status', 'past_due')->count(),
                'incomplete_subscriptions' => Subscription::where('stripe_status', 'incomplete')->count(),
                'trialing_subscriptions' => Subscription::where('stripe_status', 'trialing')->count(),
                'monthly_revenue' => Subscription::where('stripe_status', 'active')
                    ->whereHas('items', function ($query) {
                        $query->whereNotNull('stripe_price');
                    })
                    ->with('items')
                    ->get()
                    ->sum(function ($subscription) {
                        return $subscription->items->sum('quantity') ?? 0;
                    }),
            ];

            return WebResponse::success('Subscription stats retrieved successfully', $stats);
        } catch (\Exception $e) {
            return WebResponse::error('Failed to fetch subscription stats: ' . $e->getMessage());
        }
    }
}
