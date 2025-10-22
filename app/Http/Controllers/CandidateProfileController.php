<?php

namespace App\Http\Controllers;

use App\Models\CandidateProfile;
use App\Models\District;
use App\Models\Province;
use App\Models\Sector;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CandidateProfileController extends Controller
{
    public function show(): Response
    {
        $user = Auth::user();
        $profile = CandidateProfile::with(['province:id,name','district:id,name','sector:id,name'])
            ->where('user_id', $user->id)
            ->first();

        return Inertia::render('Profile/Show', [
            'profile' => $profile,
        ]);
    }
}
