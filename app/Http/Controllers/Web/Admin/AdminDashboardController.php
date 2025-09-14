<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Cashier\Subscription;

class AdminDashboardController extends Controller
{

    public function index()
    {
        $currentMonth = Carbon::now();
        $currentYear = Carbon::now()->year;

        // Calculate MRR (Monthly Recurring Revenue) for current month
        $mrr = $this->calculateMRR($currentMonth);

        // Calculate ARR (Annual Recurring Revenue) for current year
        $arr = $this->calculateARR($currentYear);

        // Count total registered users
        $totalUsers = User::count();

        return Inertia::render('admin/dashboard', [
            'mrr' => number_format($mrr, 2),
            'arr' => number_format($arr, 2),
            'totalUsers' => number_format($totalUsers),
            'lastUpdated' => Carbon::now()->format('j F Y')
        ]);
    }

    private function calculateMRR(Carbon $month): float
    {
        // Get all active subscriptions for the current month
        $activeSubscriptions = Subscription::query()->where('stripe_status', 'active')
            ->whereDate('created_at', '<=', $month->endOfMonth())
            ->where(function ($query) use ($month) {
                $query->whereNull('ends_at')
                    ->orWhereDate('ends_at', '>', $month->startOfMonth());
            })
            ->get();

        $mrr = 0;

        foreach ($activeSubscriptions as $subscription) {
            // Get the plan price from the stripe_price
            $plan = Plan::where('stripe_price_id', $subscription->stripe_price)->first();

            if ($plan) {
                // Convert based on invoice_interval
                $monthlyPrice = $this->convertToMonthlyPrice((float) $plan->price, $plan->invoice_interval);
                $mrr += $monthlyPrice * ($subscription->quantity ?? 1);
            }
        }

        return $mrr;
    }

    private function calculateARR(int $year): float
    {
        // ARR is simply MRR * 12 for the current active subscriptions
        $currentMonth = Carbon::now();
        $mrr = $this->calculateMRR($currentMonth);

        return $mrr * 12;
    }

    private function convertToMonthlyPrice(float $price, string $interval): float
    {
        return match ($interval) {
            'month' => $price,
            'year' => $price / 12,
            'week' => $price * 4.33, // Average weeks per month
            'day' => $price * 30,
            default => $price
        };
    }
}
