<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'signup_fee' => 'decimal:2',
        'trial_period' => 'integer',
        'invoice_period' => 'integer',
        'grace_period' => 'integer',
        'prorate_day' => 'integer',
        'prorate_period' => 'integer',
        'prorate_extend_due' => 'integer',
        'active_subscribers_limit' => 'integer',
        'sort_order' => 'integer',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subcription::class);
    }

    public function isStripeEnabled(): bool
    {
        return !is_null($this->stripe_price_id) && !is_null($this->stripe_product_id);
    }

    public function getPriceInCents(): int
    {
        return (int) ($this->price * 100);
    }

    public function getSignupFeeInCents(): int
    {
        return (int) ($this->signup_fee * 100);
    }
}
