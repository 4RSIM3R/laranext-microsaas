<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pages are created in FormSeeder, this is for additional test data
        if (app()->environment('local')) {
            \App\Models\Page::factory(20)->create();
        }
    }
}
