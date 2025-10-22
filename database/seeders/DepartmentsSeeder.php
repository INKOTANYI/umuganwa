<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $departments = [
            'Computer Science',
            'Electronics',
            'Information Systems',
            'Civil Engineering',
            'Mechanical Engineering',
            'Electrical Engineering',
            'Data Science',
            'Software Engineering',
            'Accounting',
            'Finance',
        ];

        foreach ($departments as $name) {
            DB::table('departments')->updateOrInsert(
                ['name' => $name],
                ['name' => $name, 'created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}
