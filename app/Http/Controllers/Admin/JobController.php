<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $per = (int) $request->get('per_page', 10);
        $q = $request->get('q');
        $rows = DB::table('job_listings')
            ->leftJoin('companies','companies.id','=','job_listings.company_id')
            ->leftJoin('departments','departments.id','=','job_listings.department_id')
            ->leftJoin('provinces','provinces.id','=','job_listings.province_id')
            ->leftJoin('districts','districts.id','=','job_listings.district_id')
            ->leftJoin('sectors','sectors.id','=','job_listings.sector_id')
            ->when($q, function($qb) use ($q){
                $qb->where(function($w) use ($q){
                    $w->where('job_listings.title','like',"%{$q}%")
                      ->orWhere('companies.title','like',"%{$q}%")
                      ->orWhere('departments.name','like',"%{$q}%");
                });
            })
            ->select(
                'job_listings.id','job_listings.title','job_listings.category','job_listings.deadline',
                'companies.title as company','departments.name as department',
                'provinces.name as province','districts.name as district','sectors.name as sector',
                'job_listings.created_at'
            )
            ->latest('job_listings.id')->paginate($per);

        return Inertia::render('Admin/Jobs/Index', [
            'jobs' => $rows,
            'filters' => ['q'=>$q, 'per_page'=>$per],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jobs/Form', [
            'job' => null,
            'companies' => Schema::hasTable('companies') ? DB::table('companies')->select('id','title')->latest('id')->get() : [],
            'departments' => Schema::hasTable('departments') ? DB::table('departments')->select('id','name')->orderBy('name')->get() : [],
            'provinces' => Schema::hasTable('provinces') ? DB::table('provinces')->select('id','name')->orderBy('name')->get() : [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'description' => ['required','string'],
            'education_level' => ['nullable','string','max:255'],
            'experience_years' => ['nullable','integer','min:0','max:80'],
            'company_id' => ['required','exists:companies,id'],
            'department_id' => ['nullable','exists:departments,id'],
            'category' => ['required','in:part_time,full_time,internship,scholarship,tender'],
            'deadline' => ['required','date'],
            'province_id' => ['nullable','exists:provinces,id'],
            'district_id' => ['nullable','exists:districts,id'],
            'sector_id' => ['nullable','exists:sectors,id'],
        ]);
        Job::create($data);
        return redirect()->route('admin.jobs.index')->with('success','Job created');
    }

    public function edit(Job $job)
    {
        return Inertia::render('Admin/Jobs/Form', [
            'job' => $job,
            'companies' => Schema::hasTable('companies') ? DB::table('companies')->select('id','title')->latest('id')->get() : [],
            'departments' => Schema::hasTable('departments') ? DB::table('departments')->select('id','name')->orderBy('name')->get() : [],
            'provinces' => Schema::hasTable('provinces') ? DB::table('provinces')->select('id','name')->orderBy('name')->get() : [],
        ]);
    }

    public function update(Request $request, Job $job)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'description' => ['required','string'],
            'education_level' => ['nullable','string','max:255'],
            'qualifications' => ['nullable','string'],
            'experience_years' => ['nullable','integer','min:0','max:80'],
            'company_id' => ['required','exists:companies,id'],
            'department_id' => ['nullable','exists:departments,id'],
            'category' => ['required','in:part_time,full_time,internship,scholarship,tender'],
            'deadline' => ['required','date'],
            'province_id' => ['nullable','exists:provinces,id'],
            'district_id' => ['nullable','exists:districts,id'],
            'sector_id' => ['nullable','exists:sectors,id'],
        ]);
        $job->update($data);
        return redirect()->route('admin.jobs.index')->with('success','Job updated');
    }

    public function destroy(Job $job)
    {
        $job->delete();
        return redirect()->route('admin.jobs.index')->with('success','Job deleted');
    }
}
