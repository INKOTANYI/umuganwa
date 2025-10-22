<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CandidateProfile;

class OtpController extends Controller
{
    public function show(): Response
    {
        // Ensure there is a pending user in session
        $pendingUserId = Session::get('pending_user_id');
        if (!$pendingUserId) {
            return Inertia::location(route('register'));
        }

        return Inertia::render('Auth/VerifyOtp', [
            'status' => session('status'),
            'devOtp' => session('dev_otp_code'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $pendingUserId = Session::get('pending_user_id');
        if (!$pendingUserId) {
            return redirect()->route('register');
        }

        $record = DB::table('otp_codes')
            ->where('user_id', $pendingUserId)
            ->where('code', $request->code)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('id')
            ->first();

        if (!$record) {
            return back()->withErrors(['code' => 'Invalid or expired code.']);
        }

        // Mark code as used
        DB::table('otp_codes')->where('id', $record->id)->update(['used_at' => now()]);

        // Clear session marker and login user
        Session::forget('pending_user_id');
        Auth::loginUsingId($pendingUserId);

        return redirect()->route('profile.complete.show');
    }
}
