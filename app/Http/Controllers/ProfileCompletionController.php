<?php

namespace App\Http\Controllers;

use App\Models\CandidateProfile;
use App\Models\Department;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProfileCompletionController extends Controller
{
    public function show(): Response|\Symfony\Component\HttpFoundation\Response
    {
        $user = Auth::user();
        $profile = CandidateProfile::where('user_id', $user->id)->first();
        if ($profile) {
            return Inertia::location(route('dashboard'));
        }

        return Inertia::render('Profile/CompleteProfile', [
            'prefill' => [
                'first_name' => $user->first_name ?? '',
                'last_name' => $user->last_name ?? '',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            'provinces' => Province::orderBy('name')->get(['id','name']),
            'departments' => Department::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'first_name' => ['required','string','max:255'],
            'last_name' => ['required','string','max:255'],
            'email' => ['required','email', Rule::unique('candidate_profiles','email')->where(fn($q)=>$q)->ignore($user->id,'user_id')],
            'phone' => ['required','regex:/^07(2|3|8)\d{7}$/', Rule::unique('candidate_profiles','phone')->where(fn($q)=>$q)->ignore($user->id,'user_id')],
            'date_of_birth' => ['required','date','before_or_equal:'.now()->subYears(18)->toDateString()],
            'gender' => ['required', Rule::in(['male','female','other'])],
            'short_bio' => ['required','string','max:2000'],
            'education_level' => ['required', Rule::in(['phd','masters','bachelor','secondary','certificates'])],
            'graduation_date' => ['required','date','before_or_equal:today'],
            'languages' => ['required','array','min:1'],
            'languages.*' => ['in:english,french,kinyarwanda,swahili'],
            'province_id' => ['required','exists:provinces,id'],
            'district_id' => ['required','exists:districts,id'],
            'sector_id' => ['required','exists:sectors,id'],
            'department_id' => ['required','exists:departments,id'],
            'cv' => ['required','file','max:5120','mimes:pdf,doc,docx,jpg,png'],
            'degree' => ['required','file','max:5120','mimes:pdf,doc,docx,jpg,png'],
            'certificates' => ['nullable','array'],
            'certificates.*' => ['file','max:5120','mimes:pdf,doc,docx,jpg,png'],
            'identity_doc' => ['required','file','max:5120','mimes:pdf,doc,docx,jpg,png'],
        ]);

        // Compute experience years from graduation date to today (rounded down)
        $grad = Carbon::parse($request->graduation_date);
        $experienceYears = max(0, (int) floor($grad->diffInDays(Carbon::today()) / 365.25));

        $cvPath = $request->file('cv')->store('profiles/cv', 'public');
        $degreePath = $request->file('degree')->store('profiles/degree', 'public');
        $identityPath = $request->file('identity_doc')->store('profiles/identity', 'public');
        $certPaths = [];
        if ($request->hasFile('certificates')) {
            foreach ($request->file('certificates') as $file) {
                $certPaths[] = $file->store('profiles/certificates', 'public');
            }
        }

        CandidateProfile::create([
            'user_id' => $user->id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'short_bio' => $request->short_bio,
            'education_level' => $request->education_level,
            'graduation_date' => $request->graduation_date,
            'experience_years' => $experienceYears,
            'languages' => $request->languages,
            'province_id' => $request->province_id,
            'district_id' => $request->district_id,
            'sector_id' => $request->sector_id,
            'department_id' => $request->department_id,
            'cv_path' => $cvPath,
            'degree_path' => $degreePath,
            'identity_doc_path' => $identityPath,
            'certificates_paths' => $certPaths,
        ]);

        return redirect()->route('dashboard')->with('success', 'Your profile has been completed successfully.');
    }
}
