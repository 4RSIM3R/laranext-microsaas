<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fields are created in FormSeeder, this is for additional test data
        if (app()->environment('local')) {
            \App\Models\Field::factory(50)->create();
        }
    }
}
