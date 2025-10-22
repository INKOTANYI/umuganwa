<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileCompletionController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\CandidateProfileController;
use App\Models\CandidateProfile;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Notifications\ApplicationStatusUpdated;

Route::get('/', function () {
    $categories = ['full_time','part_time','internship','scholarship','tender'];
    $provinces = Schema::hasTable('provinces')
        ? DB::table('provinces')->select('id','name')->orderBy('name')->get()
        : collect();

    $baseQuery = function() {
        if (!Schema::hasTable('job_listings')) return DB::table('job_listings');
        return DB::table('job_listings')
            ->leftJoin('companies','companies.id','=','job_listings.company_id')
            ->leftJoin('departments','departments.id','=','job_listings.department_id')
            ->leftJoin('provinces','provinces.id','=','job_listings.province_id')
            ->leftJoin('districts','districts.id','=','job_listings.district_id')
            ->leftJoin('sectors','sectors.id','=','job_listings.sector_id')
            ->whereDate('job_listings.deadline','>=', now()->toDateString())
            ->select(
                'job_listings.id','job_listings.title','job_listings.category','job_listings.deadline','job_listings.created_at',
                DB::raw('COALESCE(companies.title, "") as company'),
                DB::raw('COALESCE(departments.name, "") as department'),
                DB::raw('COALESCE(provinces.name, "") as province'),
                DB::raw('COALESCE(districts.name, "") as district'),
                DB::raw('COALESCE(sectors.name, "") as sector')
            );
    };

    $featuredJobs = Schema::hasTable('job_listings')
        ? $baseQuery()->latest('job_listings.id')->limit(6)->get()
        : collect();

    $latestJobs = Schema::hasTable('job_listings')
        ? $baseQuery()->latest('job_listings.id')->paginate(10)
        : ['data'=>[],'links'=>[]];

    $topCompanies = (Schema::hasTable('companies') && Schema::hasTable('job_listings'))
        ? DB::table('companies')
            ->leftJoin('job_listings','job_listings.company_id','=','companies.id')
            ->where(function($w){ $w->whereNull('job_listings.id')->orWhereDate('job_listings.deadline','>=', now()->toDateString()); })
            ->groupBy('companies.id','companies.title','companies.logo_path')
            ->orderByRaw('COUNT(job_listings.id) DESC')
            ->limit(8)
            ->get([
                'companies.id',
                'companies.title',
                'companies.logo_path',
                DB::raw('COUNT(job_listings.id) as open_jobs')
            ])
        : collect();

    $stats = [
        'jobs' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
        'companies' => Schema::hasTable('companies')
            ? DB::table('companies')->count()
            : 0,
        'candidates' => Schema::hasTable('users')
            ? DB::table('users')->count()
            : 0,
    ];

    $categoryCounts = [
        'full_time' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->where('category','full_time')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
        'part_time' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->where('category','part_time')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
        'internship' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->where('category','internship')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
        'scholarship' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->where('category','scholarship')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
        'tender' => Schema::hasTable('job_listings')
            ? DB::table('job_listings')->where('category','tender')->whereDate('deadline','>=', now()->toDateString())->count()
            : 0,
    ];

    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'categories' => $categories,
        'provinces' => $provinces,
        'featuredJobs' => $featuredJobs,
        'latestJobs' => $latestJobs,
        'topCompanies' => $topCompanies,
        'stats' => $stats,
        'categoryCounts' => $categoryCounts,
        'logoUrl' => url('logo.png'),
        'heroImageUrl' => url('images/hero.jpg'),
    ]);
});

// Public Jobs
Route::get('/jobs', [\App\Http\Controllers\JobsController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{job}', [\App\Http\Controllers\JobsController::class, 'show'])->name('jobs.show');

// Public AJAX Jobs API for homepage search (no page reload)
Route::get('/api/public/jobs', function() {
    if (!Schema::hasTable('job_listings')) {
        return response()->json(['data' => [], 'links' => [], 'total' => 0]);
    }
    $appsTable = Schema::hasTable('applications') ? 'applications' : (Schema::hasTable('job_applications') ? 'job_applications' : null);
    $q = request('q');
    $category = request('category');
    $provinceId = request('province_id');
    $districtId = request('district_id');
    $sectorId = request('sector_id');

    $qb = DB::table('job_listings')
        ->leftJoin('companies','companies.id','=','job_listings.company_id')
        ->leftJoin('departments','departments.id','=','job_listings.department_id')
        ->leftJoin('provinces','provinces.id','=','job_listings.province_id')
        ->leftJoin('districts','districts.id','=','job_listings.district_id')
        ->leftJoin('sectors','sectors.id','=','job_listings.sector_id')
        ->whereDate('job_listings.deadline','>=', now()->toDateString())
        ->when($q, function($w) use ($q) {
            $w->where(function($sub) use ($q) {
                $sub->where('job_listings.title','like',"%{$q}%")
                    ->orWhere('companies.title','like',"%{$q}%");
            });
        })
        ->when($category, function($w) use ($category) {
            if ($category === 'jobs') {
                $w->whereIn('job_listings.category', ['full_time','part_time']);
            } else {
                $w->where('job_listings.category', $category);
            }
        })
        ->when($provinceId, fn($w) => $w->where('job_listings.province_id', $provinceId))
        ->when($districtId, fn($w) => $w->where('job_listings.district_id', $districtId))
        ->when($sectorId, fn($w) => $w->where('job_listings.sector_id', $sectorId))
        ->select(
            'job_listings.id','job_listings.title','job_listings.category','job_listings.deadline','job_listings.created_at',
            DB::raw('COALESCE(companies.title, "") as company'),
            DB::raw('COALESCE(departments.name, "") as department'),
            DB::raw('COALESCE(provinces.name, "") as province'),
            DB::raw('COALESCE(districts.name, "") as district'),
            DB::raw('COALESCE(sectors.name, "") as sector')
        )
        ->latest('job_listings.id');

    // Add applied flag for authenticated users if applications table exists
    if (Auth::check() && $appsTable) {
        $userId = Auth::id();
        $qb->addSelect(DB::raw("EXISTS(SELECT 1 FROM {$appsTable} a WHERE a.user_id = {$userId} AND a.job_id = job_listings.id) as applied"));
    } else {
        $qb->addSelect(DB::raw('0 as applied'));
    }

    $per = (int) request('per_page', 10);
    $rows = $qb->paginate($per);
    return response()->json($rows);
})->name('api.public.jobs');

// Public single job details (AJAX)
Route::get('/api/public/jobs/{job}', function($jobId) {
    if (!Schema::hasTable('job_listings')) {
        return response()->json(null, 404);
    }
    $appsTable = Schema::hasTable('applications') ? 'applications' : (Schema::hasTable('job_applications') ? 'job_applications' : null);
    $row = DB::table('job_listings')
        ->leftJoin('companies','companies.id','=','job_listings.company_id')
        ->leftJoin('departments','departments.id','=','job_listings.department_id')
        ->leftJoin('provinces','provinces.id','=','job_listings.province_id')
        ->leftJoin('districts','districts.id','=','job_listings.district_id')
        ->leftJoin('sectors','sectors.id','=','job_listings.sector_id')
        ->where('job_listings.id', $jobId)
        ->select(
            'job_listings.*',
            DB::raw('COALESCE(companies.title, "") as company'),
            DB::raw('COALESCE(departments.name, "") as department'),
            DB::raw('COALESCE(provinces.name, "") as province'),
            DB::raw('COALESCE(districts.name, "") as district'),
            DB::raw('COALESCE(sectors.name, "") as sector')
        )->first();
    if (!$row) return response()->json(null, 404);
    // Add applied flag if possible
    if (Auth::check() && $appsTable) {
        $applied = DB::table($appsTable)->where('user_id', Auth::id())->where('job_id', $jobId)->exists();
        $row->applied = $applied ? 1 : 0;
    } else {
        $row->applied = 0;
    }
    return response()->json($row);
})->name('api.public.jobs.show');

// Create application (AJAX, requires auth)
Route::post('/api/applications', function() {
    if (!Auth::check()) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    $appsTable = Schema::hasTable('applications') ? 'applications' : (Schema::hasTable('job_applications') ? 'job_applications' : null);
    if (!$appsTable) { return response()->json(['message' => 'Applications table not found'], 500); }
    $user = Auth::user();
    $jobId = request('job_id');
    $motivation = request('motivation');
    if (!$jobId || !is_string($motivation)) {
        return response()->json(['message' => 'Invalid data'], 422);
    }
    $exists = DB::table($appsTable)->where('user_id',$user->id)->where('job_id',$jobId)->exists();
    if ($exists) {
        return response()->json(['message' => 'Already applied'], 409);
    }
    try {
        $column = Schema::hasColumn($appsTable, 'motivation') ? 'motivation'
            : (Schema::hasColumn($appsTable, 'cover_letter') ? 'cover_letter'
            : (Schema::hasColumn($appsTable, 'letter') ? 'letter'
            : (Schema::hasColumn($appsTable, 'message') ? 'message'
            : (Schema::hasColumn($appsTable, 'notes') ? 'notes'
            : (Schema::hasColumn($appsTable, 'content') ? 'content' : null)))));
        if (!$column) { return response()->json(['message' => 'Motivation column not found'], 500); }
        $payload = [
            'user_id' => $user->id,
            'job_id' => $jobId,
            $column => $motivation,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        $id = DB::table($appsTable)->insertGetId($payload);
        return response()->json(['id' => $id, 'message' => 'Application submitted']);
    } catch (\Throwable $e) {
        return response()->json(['message' => 'Save failed', 'error' => $e->getMessage()], 500);
    }
})->middleware('auth')->name('api.applications.store');

Route::get('/dashboard', function () {
    $user = Auth::user();
    $profile = $user ? CandidateProfile::where('user_id', $user->id)->first() : null;
    return Inertia::render('Dashboard', [
        'profile' => $profile,
    ]);
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/view', [CandidateProfileController::class, 'show'])->name('candidate.profile.show');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Profile completion
    Route::get('/profile/complete', [ProfileCompletionController::class, 'show'])->name('profile.complete.show');
    Route::post('/profile/complete', [ProfileCompletionController::class, 'store'])->name('profile.complete.store');

    // Dependent locations
    Route::get('/locations/districts', [LocationsController::class, 'districts'])->name('locations.districts');
    Route::get('/locations/sectors', [LocationsController::class, 'sectors'])->name('locations.sectors');

    // Admin Dashboard (basic stats)
    Route::get('/admin', function () {
        $stats = [
            'users' => DB::table('users')->count(),
            'profiles' => DB::table('candidate_profiles')->count(),
            'jobs' => Schema::hasTable('jobs') ? DB::table('jobs')->count() : 0,
            'applications' => Schema::hasTable('job_applications') ? DB::table('job_applications')->count() : 0,
            'companies' => Schema::hasTable('companies') ? DB::table('companies')->count() : 0,
            'support_open' => Schema::hasTable('support_tickets') ? DB::table('support_tickets')->where('status','open')->count() : 0,
        ];

        $recentUsers = DB::table('users')
            ->select('id', 'name', 'email', 'created_at')
            ->latest('id')->limit(5)->get();

        $recentCompanies = Schema::hasTable('companies')
            ? DB::table('companies')->select('id', 'company_id', 'title', 'website', 'created_at')->latest('id')->limit(5)->get()
            : collect();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentCompanies' => $recentCompanies,
        ]);
    })->middleware('admin')->name('admin.dashboard');

    // Admin Companies
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        // Users page + DataTables data endpoint
        Route::get('/users', [AdminUsersController::class, 'index'])->name('users.index');
        Route::get('/users/data', [AdminUsersController::class, 'data'])->name('users.data');

        Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
        Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
        Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
        Route::get('/companies/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit');
        Route::put('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update');
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');

        // Jobs CRUD
        Route::get('/jobs', [\App\Http\Controllers\Admin\JobController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/create', [\App\Http\Controllers\Admin\JobController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [\App\Http\Controllers\Admin\JobController::class, 'store'])->name('jobs.store');
        Route::get('/jobs/{job}/edit', [\App\Http\Controllers\Admin\JobController::class, 'edit'])->name('jobs.edit');
        Route::put('/jobs/{job}', [\App\Http\Controllers\Admin\JobController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}', [\App\Http\Controllers\Admin\JobController::class, 'destroy'])->name('jobs.destroy');

        // Applications page
        Route::get('/applications', function () {
            return Inertia::render('Admin/Applications/Index');
        })->name('applications.index');

        // Applications list API (paginated)
        Route::get('/api/applications', function () {
            if (!Schema::hasTable('job_applications')) {
                return response()->json(['data' => [], 'total' => 0, 'links' => []]);
            }
            $per = (int) request('per_page', 10);
            $q = request('q');
            $sort = request('sort');
            $dir = strtolower(request('dir', 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = [
                'id' => 'job_applications.id',
                'created_at' => 'job_applications.created_at',
                'user' => 'users.first_name',
                'job' => 'job_listings.title',
                'company' => 'companies.title',
            ];

            $qb = DB::table('job_applications')
                ->leftJoin('users','users.id','=','job_applications.user_id')
                ->leftJoin('candidate_profiles','candidate_profiles.user_id','=','users.id')
                ->leftJoin('job_listings','job_listings.id','=','job_applications.job_id')
                ->leftJoin('companies','companies.id','=','job_listings.company_id')
                ->when($q, function($w) use ($q) {
                    $w->where(function($sub) use ($q) {
                        $sub->where('users.first_name','like',"%{$q}%")
                            ->orWhere('users.last_name','like',"%{$q}%")
                            ->orWhere('users.email','like',"%{$q}%")
                            ->orWhere('job_listings.title','like',"%{$q}%")
                            ->orWhere('companies.title','like',"%{$q}%");
                    });
                })
                ->select(
                    'job_applications.id',
                    'job_applications.created_at',
                    'job_applications.motivation',
                    'job_applications.status',
                    'job_applications.reviewed_by',
                    'job_applications.reviewed_at',
                    'users.id as user_id',
                    DB::raw("CONCAT(COALESCE(users.first_name,''),' ',COALESCE(users.last_name,'')) as user_name"),
                    'users.email as user_email',
                    'job_listings.id as job_id',
                    'job_listings.title as job_title',
                    DB::raw('COALESCE(companies.title, "") as company_title'),
                    'candidate_profiles.cv_path',
                    'candidate_profiles.degree_path',
                    'candidate_profiles.certificates_paths'
                );

            if ($sort && isset($allowedSorts[$sort])) {
                $qb->orderBy($allowedSorts[$sort], $dir);
            } else {
                $qb->latest('job_applications.id');
            }

            $rows = $qb->paginate($per);
            return response()->json($rows);
        })->name('api.applications');

        // Update application status and notify user
        Route::post('/applications/{application}/status', function ($applicationId) {
            if (!Schema::hasTable('job_applications')) {
                return response()->json(['message' => 'Applications table not found'], 500);
            }
            $status = request('status');
            $allowed = ['pending','selected','approved','rejected'];
            if (!in_array($status, $allowed, true)) {
                return response()->json(['message' => 'Invalid status'], 422);
            }
            $row = DB::table('job_applications')->where('id', $applicationId)->first();
            if (!$row) return response()->json(['message' => 'Not found'], 404);

            DB::table('job_applications')->where('id', $applicationId)->update([
                'status' => $status,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'updated_at' => now(),
            ]);

            // Notify user
            $user = DB::table('users')->where('id', $row->user_id)->first();
            $job = DB::table('job_listings')->where('id', $row->job_id)->select('id','title')->first();
            if ($user && $job) {
                try {
                    $uModel = \App\Models\User::find($user->id);
                    $uModel?->notify(new ApplicationStatusUpdated($job->title, $status, (string) $applicationId));
                } catch (\Throwable $e) {}
            }

            return response()->json(['ok' => true]);
        })->name('applications.status');

        // Admin API for modal tables
        Route::get('/api/users', function () {
            $q = request('q');
            $sort = request('sort');
            $dir = strtolower(request('dir', 'desc')) === 'asc' ? 'asc' : 'desc';
            $allowedSorts = [
                'id' => 'users.id',
                'first_name' => 'users.first_name',
                'last_name' => 'users.last_name',
                'email' => 'users.email',
                'created_at' => 'users.created_at',
            ];
            $users = DB::table('users')
                ->leftJoin('candidate_profiles','candidate_profiles.user_id','=','users.id')
                ->leftJoin('provinces','provinces.id','=','candidate_profiles.province_id')
                ->leftJoin('districts','districts.id','=','candidate_profiles.district_id')
                ->leftJoin('sectors','sectors.id','=','candidate_profiles.sector_id')
                ->when($q, fn($qb) => $qb->where(function($w) use ($q){
                    $w->where('users.name','like',"%{$q}%")
                      ->orWhere('users.email','like',"%{$q}%")
                      ->orWhere('users.first_name','like',"%{$q}%")
                      ->orWhere('users.last_name','like',"%{$q}%")
                      ->orWhere('users.phone','like',"%{$q}%")
                      ->orWhere('candidate_profiles.address_line','like',"%{$q}%");
                }))
                ->select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.phone',
                    'users.email',
                    'users.is_admin',
                    'users.created_at',
                    DB::raw('COALESCE(candidate_profiles.address_line, "") as address_line'),
                    'candidate_profiles.education_level',
                    'candidate_profiles.experience_years',
                    'candidate_profiles.gender',
                    'candidate_profiles.cv_path',
                    'candidate_profiles.degree_path',
                    'candidate_profiles.certificates_paths',
                    DB::raw('COALESCE(provinces.name, "") as province'),
                    DB::raw('COALESCE(districts.name, "") as district'),
                    DB::raw('COALESCE(sectors.name, "") as sector')
                )
                ->when($sort && isset($allowedSorts[$sort]), function($qb) use ($allowedSorts, $sort, $dir) {
                    return $qb->orderBy($allowedSorts[$sort], $dir);
                }, function($qb) {
                    return $qb->latest('users.id');
                })
                ->paginate((int) request('per_page', 10));
            return response()->json($users);
        })->name('api.users');

        Route::get('/api/users/export', function () {
            $q = request('q');
            $rows = DB::table('users')
                ->leftJoin('candidate_profiles','candidate_profiles.user_id','=','users.id')
                ->when($q, fn($qb) => $qb->where(function($w) use ($q){
                    $w->where('users.name','like',"%{$q}%")
                      ->orWhere('users.email','like',"%{$q}%")
                      ->orWhere('users.first_name','like',"%{$q}%")
                      ->orWhere('users.last_name','like',"%{$q}%")
                      ->orWhere('users.phone','like',"%{$q}%")
                      ->orWhere('candidate_profiles.address_line','like',"%{$q}%");
                }))
                ->select(
                    'users.id','users.name','users.first_name','users.last_name','users.phone','users.email','users.is_admin','users.created_at',
                    DB::raw('COALESCE(candidate_profiles.address_line, "") as address_line'),
                    'candidate_profiles.education_level','candidate_profiles.experience_years','candidate_profiles.gender'
                )
                ->latest('users.id')->get();

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename=users_export.csv',
            ];

            $callback = function() use ($rows) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['ID','Name','First Name','Last Name','Phone','Email','Role','Address','Education','Experience (yrs)','Gender','Created At']);
                foreach ($rows as $r) {
                    fputcsv($handle, [
                        $r->id,
                        $r->name,
                        $r->first_name,
                        $r->last_name,
                        $r->phone,
                        $r->email,
                        $r->is_admin ? 'Admin' : 'User',
                        $r->address_line,
                        $r->education_level,
                        $r->experience_years,
                        $r->gender,
                        $r->created_at,
                    ]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        })->name('api.users.export');

        Route::get('/api/companies', function () {
            if (!Schema::hasTable('companies')) return response()->json(['data'=>[], 'total'=>0]);
            $q = request('q');
            $per = (int) request('per_page', 10);
            $companies = DB::table('companies')
                ->when($q, fn($qb) => $qb->where(function($w) use ($q){
                    $w->where('company_id','like',"%{$q}%")->orWhere('title','like',"%{$q}%");
                }))
                ->leftJoin('departments','departments.id','=','companies.department_id')
                ->leftJoin('provinces','provinces.id','=','companies.province_id')
                ->leftJoin('districts','districts.id','=','companies.district_id')
                ->leftJoin('sectors','sectors.id','=','companies.sector_id')
                ->select(
                    'companies.id',
                    'companies.company_id',
                    'companies.title',
                    'companies.description',
                    DB::raw('COALESCE(departments.name, "") as department'),
                    'companies.logo_path',
                    DB::raw('COALESCE(provinces.name, "") as province'),
                    DB::raw('COALESCE(districts.name, "") as district'),
                    DB::raw('COALESCE(sectors.name, "") as sector'),
                    'companies.created_at'
                )
                ->latest('companies.id')->paginate($per);
            return response()->json($companies);
        })->name('api.companies');

        // Admin Support API
        Route::get('/api/support', [SupportController::class, 'adminIndex'])->name('api.support');
        Route::post('/support/{ticket}/reply', [SupportController::class, 'reply'])->name('support.reply');

        // Admin Support Inbox page
        Route::get('/support', function () {
            return Inertia::render('Admin/Support/Index');
        })->name('support.index');
    });

    // Contact Support (AJAX/form with attachments)
    Route::post('/support/ticket', [SupportController::class, 'store'])->name('support.ticket');
    Route::get('/support/my', [SupportController::class, 'myTickets'])->name('support.my');

    // Notifications (JSON APIs)
    Route::get('/notifications', [NotificationsController::class, 'list'])->name('notifications.list');
    Route::get('/notifications/unread-count', [NotificationsController::class, 'unreadCount'])->name('notifications.unread_count');
    Route::post('/notifications/read', [NotificationsController::class, 'markRead'])->name('notifications.mark_read');
    Route::post('/notifications/read-all', [NotificationsController::class, 'markAllRead'])->name('notifications.mark_all');
});

require __DIR__.'/auth.php';
