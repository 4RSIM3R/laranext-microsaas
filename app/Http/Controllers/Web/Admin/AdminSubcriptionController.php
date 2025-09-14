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
    protected SubcriptionContract $service;

    public function __construct(SubcriptionContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('admin/subcription/index');
    }

    public function fetch(Request $request)
    {
        $data = $this->service->all(
            filters: [],
            sorts: [],
            paginate: true,
            relation: ['user:id,name,email', 'items'],
            per_page: $request->per_page ?? 15,
            order_column: 'created_at',
            order_position: 'desc'
        );

        return response()->json($data);
    }

    public function show($id)
    {
        try {
            $subscription = $this->service->find($id, ['user:id,name,email', 'items']);

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
                        return $subscription->items->sum(function ($item) {
                            return $item->stripe_price * $item->quantity;
                        });
                    }),
            ];

            return WebResponse::success('Subscription stats retrieved successfully', $stats);
        } catch (\Exception $e) {
            return WebResponse::error('Failed to fetch subscription stats: ' . $e->getMessage());
        }
    }
}
