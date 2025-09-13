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
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained()->onDelete('cascade');
            $table->string('label');
            $table->string('name');
            $table->string('type');
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->string('default_value')->nullable();
            $table->boolean('required')->default(false);
            $table->json('validation')->default('[]');
            $table->json('options')->default('[]');
            $table->json('conditions')->default('[]');
            $table->json('settings')->default('{}');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('page_id');
            $table->index('sort_order');
            $table->unique(['page_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fields');
    }
};
