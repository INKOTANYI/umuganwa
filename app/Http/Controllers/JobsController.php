<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class JobsController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->get('q');
        $category = $request->get('category');
        $province = $request->get('province_id');
        $district = $request->get('district_id');
        $sector = $request->get('sector_id');
        $per = (int) $request->get('per_page', 12);

        $jobs = DB::table('job_listings')
            ->leftJoin('companies','companies.id','=','job_listings.company_id')
            ->leftJoin('provinces','provinces.id','=','job_listings.province_id')
            ->leftJoin('districts','districts.id','=','job_listings.district_id')
            ->leftJoin('sectors','sectors.id','=','job_listings.sector_id')
            ->when($q, function($qb) use ($q) {
                $qb->where(function($w) use ($q){
                    $w->where('job_listings.title','like',"%{$q}%")
                      ->orWhere('job_listings.description','like',"%{$q}%")
                      ->orWhere('companies.title','like',"%{$q}%");
                });
            })
            ->when($category, fn($qb) => $qb->where('job_listings.category', $category))
            ->when($province, fn($qb) => $qb->where('job_listings.province_id', $province))
            ->when($district, fn($qb) => $qb->where('job_listings.district_id', $district))
            ->when($sector, fn($qb) => $qb->where('job_listings.sector_id', $sector))
            ->select(
                'job_listings.id','job_listings.title','job_listings.category','job_listings.deadline','job_listings.description',
                'companies.title as company','provinces.name as province','districts.name as district','sectors.name as sector',
                'job_listings.created_at'
            )
            ->whereDate('job_listings.deadline','>=', now()->toDateString())
            ->latest('job_listings.id')
            ->paginate($per);

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'filters' => [
                'q' => $q,
                'category' => $category,
                'province_id' => $province,
                'district_id' => $district,
                'sector_id' => $sector,
                'per_page' => $per,
            ],
            'categories' => ['full_time','part_time','internship','scholarship','tender'],
            'provinces' => Schema::hasTable('provinces') ? DB::table('provinces')->select('id','name')->orderBy('name')->get() : [],
        ]);
    }

    public function show(Job $job)
    {
        $company = Schema::hasTable('companies') ? DB::table('companies')->find($job->company_id) : null;
        $qualification = $job->department_id && Schema::hasTable('departments')
            ? DB::table('departments')->where('id', $job->department_id)->value('name')
            : null;
        $location = [
            'province' => $job->province_id && Schema::hasTable('provinces') ? DB::table('provinces')->where('id',$job->province_id)->value('name') : null,
            'district' => $job->district_id && Schema::hasTable('districts') ? DB::table('districts')->where('id',$job->district_id)->value('name') : null,
            'sector' => $job->sector_id && Schema::hasTable('sectors') ? DB::table('sectors')->where('id',$job->sector_id)->value('name') : null,
        ];
        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'company' => $company,
            'qualification' => $qualification,
            'location' => $location,
        ]);
    }
}
