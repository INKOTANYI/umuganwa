<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $departments = \DB::table('departments')->pluck('name','id');
        return Inertia::render('Admin/Companies/Index', [
            'companies' => Company::latest()->paginate(10)->through(function($c) use ($departments){
                return [
                    'id' => $c->id,
                    'title' => $c->title,
                    'description' => $c->description,
                    'department' => $c->department_id ? ($departments[$c->department_id] ?? '') : '',
                    'location' => [
                        'province_id' => $c->province_id,
                        'district_id' => $c->district_id,
                        'sector_id' => $c->sector_id,
                    ],
                    'logo_url' => $c->logo_path ? Storage::url($c->logo_path) : null,
                ];
            }),
        ]);
    }

    public function create()
    {
        $provinces = \DB::table('provinces')->select('id','name')->orderBy('name')->get();
        $departments = \DB::table('departments')->select('id','name')->orderBy('name')->get();
        return Inertia::render('Admin/Companies/Create', [
            'provinces' => $provinces,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        if (!Schema::hasTable('companies')) {
            return back()->withInput()->with('error', 'Companies table is missing. Please run migrations (php artisan migrate).');
        }

        $rules = [
            'company_id' => ['nullable','string','max:50','regex:/^[A-Z0-9-]+$/'],
            'title' => ['required','string','max:150'],
            'description' => ['nullable','string'],
            'department_id' => ['nullable','integer','exists:departments,id'],
            'province_id' => ['required','integer','exists:provinces,id'],
            'district_id' => ['required','integer','exists:districts,id'],
            'sector_id' => ['required','integer','exists:sectors,id'],
            'logo' => ['nullable','file','mimes:png,jpg,jpeg,webp','max:5120'],
        ];
        // Only add unique rule if the table is present (already ensured above) to avoid DB errors in other environments
        $rules['company_id'][] = 'unique:companies,company_id';

        $validated = $request->validate($rules);

        try {
            // Generate company_id from title if not provided
            $companyId = $validated['company_id'] ?? null;
            if (!$companyId) {
                $base = strtoupper(preg_replace('/[^A-Z0-9]+/i', '-', $validated['title']));
                $base = trim($base, '-');
                $companyId = substr($base, 0, 30);
                // Ensure unique by appending number if needed
                $suffix = 1;
                $candidate = $companyId;
                while (\DB::table('companies')->where('company_id', $candidate)->exists()) {
                    $suffix++;
                    $candidate = substr($companyId, 0, max(1, 30 - (strlen((string)$suffix)+1))) . '-' . $suffix;
                }
                $companyId = $candidate;
            } else {
                $companyId = strtoupper($companyId);
            }

            $data = $validated;
            $data['company_id'] = $companyId;

            if ($request->hasFile('logo')) {
                $data['logo_path'] = $request->file('logo')->store('logos','public');
            }
            unset($data['logo']);

            Company::create($data);

            return redirect()->route('admin.dashboard')->with('success', 'Company created')->with('openCompanies', true);
        } catch (\Throwable $e) {
            return back()->withInput()->with('error', 'Failed to create company: '.$e->getMessage());
        }
    }
}
