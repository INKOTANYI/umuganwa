<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RwandaProvincesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $provinces = [
            'Kigali City',
            'Northern',
            'Southern',
            'Eastern',
            'Western',
        ];

        foreach ($provinces as $name) {
            DB::table('provinces')->updateOrInsert(
                ['name' => $name],
                ['name' => $name, 'created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}
