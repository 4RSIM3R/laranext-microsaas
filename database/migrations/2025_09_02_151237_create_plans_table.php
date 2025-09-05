<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('price')->default(0);
            $table->decimal('signup_fee')->default(0);
            $table->unsignedInteger('trial_period')->default(0);
            $table->string('trial_interval')->default('day');
            $table->unsignedInteger('invoice_period')->default(0);
            $table->string('invoice_interval')->default('month');
            $table->unsignedInteger('grace_period')->default(0);
            $table->string('grace_interval')->default('day');
            $table->unsignedInteger('prorate_day')->nullable();
            $table->unsignedInteger('prorate_period')->nullable();
            $table->unsignedInteger('prorate_extend_due')->nullable();
            $table->unsignedInteger('active_subscribers_limit')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('stripe_price_id')->nullable()->unique();
            $table->string('stripe_product_id')->nullable();
            $table->string('currency', 3)->default('usd');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
