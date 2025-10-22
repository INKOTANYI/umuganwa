<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class MakeAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'admin@ishakiro.com';
        $password = 'Inkotanyi123@';

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'System Admin',
                'first_name' => 'System',
                'last_name' => 'Admin',
                'phone' => null,
                'password' => Hash::make($password),
            ]
        );

        // Ensure password and admin flag are set (idempotent)
        $user->is_admin = true;
        $user->first_name = $user->first_name ?: 'System';
        $user->last_name = $user->last_name ?: 'Admin';
        // leave phone as-is or null to avoid unique conflicts
        $user->password = Hash::make($password);
        $user->save();

        $this->command->info("Admin ensured: {$email}");
    }
}
