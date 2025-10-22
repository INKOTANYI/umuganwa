<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class EnsureAdmin extends Command
{
    protected $signature = 'ensure:admin {email} {password} {--name=System Admin}';
    protected $description = 'Create or update an admin user with the given email and password';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $password = (string) $this->argument('password');
        $name = (string) $this->option('name');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email');
            return self::FAILURE;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'first_name' => explode(' ', $name)[0] ?? 'System',
                'last_name' => explode(' ', $name, 2)[1] ?? 'Admin',
                'phone' => '0780000000',
                'password' => Hash::make($password),
            ]
        );

        $user->is_admin = true;
        $user->password = Hash::make($password);
        if (!$user->first_name) $user->first_name = 'System';
        if (!$user->last_name) $user->last_name = 'Admin';
        if (!$user->phone) $user->phone = '0780000000';
        $user->save();

        $this->info("OK: Admin ensured for {$email}");
        return self::SUCCESS;
    }
}
