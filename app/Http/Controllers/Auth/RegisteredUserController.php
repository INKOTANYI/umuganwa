<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use App\Models\User as AppUser;
use App\Notifications\OtpCodeNotification;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:30|unique:users,phone',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['first_name'].' '.$validated['last_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        // Generate a 6-digit OTP
        $code = str_pad(strval(random_int(0, 999999)), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(10);

        DB::table('otp_codes')->insert([
            'user_id' => $user->id,
            'code' => $code,
            'channel' => 'email',
            'sent_to' => $user->email,
            'expires_at' => $expiresAt,
            'used_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // In local, show OTP on UI (flash to session). In production, send via email only.
        if (app()->environment('local')) {
            Session::flash('dev_otp_code', $code);
        } else {
            try {
                $user->notify(new OtpCodeNotification($code));
            } catch (\Throwable $e) {
                Log::warning('Failed to send OTP email: '.$e->getMessage());
            }
        }

        // Store pending user id in session and redirect to OTP verification
        Session::put('pending_user_id', $user->id);

        return redirect()->route('otp.verify.show');
    }
}

