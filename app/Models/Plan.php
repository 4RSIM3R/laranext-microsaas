<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'price',
        'signup_fee',
        'trial_period',
        'trial_interval',
        'invoice_period',
        'invoice_interval',
        'grace_period',
        'grace_interval',
        'prorate_day',
        'prorate_period',
        'prorate_extend_due',
        'active_subscribers_limit',
        'sort_order',
        'stripe_price_id',
        'stripe_product_id',
        'currency'
    ];

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
        return $this->hasMany(\Laravel\Cashier\Subscription::class, 'stripe_price', 'stripe_price_id');
    }

    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
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

    public function getFormattedPrice(): string
    {
        return number_format((float) $this->price, 2);
    }

    public function hasFreeTrial(): bool
    {
        return $this->trial_period > 0;
    }

    public function getTrialDescription(): string
    {
        if (!$this->hasFreeTrial()) {
            return '';
        }

        return $this->trial_period . ' ' . $this->trial_interval . ($this->trial_period > 1 ? 's' : '') . ' free trial';
    }

    public function isPopular(): bool
    {
        return $this->sort_order === 1;
    }
}
