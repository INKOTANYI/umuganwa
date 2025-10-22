<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Generate a few demo users
        User::factory(5)->create();

        // Explicit test user
        User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '0780000000',
        ]);

        // Core taxonomies
        $this->call([
            DepartmentsSeeder::class,
            RwandaProvincesSeeder::class,
            RwandaDistrictsSeeder::class,
            RwandaSectorsSeeder::class,
        ]);
    }
}
