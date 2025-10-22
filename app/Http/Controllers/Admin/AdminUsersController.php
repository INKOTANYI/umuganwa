<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class AdminUsersController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users/Index');
    }

    public function data(Request $request)
    {
        try {
            $query = DB::table('users')
                ->leftJoin('candidate_profiles','candidate_profiles.user_id','=','users.id');

            $hasProvinces = Schema::hasTable('provinces');
            $hasDistricts = Schema::hasTable('districts');
            $hasSectors   = Schema::hasTable('sectors');

            if ($hasProvinces) {
                $query->leftJoin('provinces','provinces.id','=','candidate_profiles.province_id');
            }
            if ($hasDistricts) {
                $query->leftJoin('districts','districts.id','=','candidate_profiles.district_id');
            }
            if ($hasSectors) {
                $query->leftJoin('sectors','sectors.id','=','candidate_profiles.sector_id');
            }

            $query->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.phone',
                'users.email',
                'candidate_profiles.education_level',
                'candidate_profiles.experience_years',
                'candidate_profiles.gender',
                DB::raw(($hasProvinces ? 'COALESCE(provinces.name, "")' : '""').' as province'),
                DB::raw(($hasDistricts ? 'COALESCE(districts.name, "")' : '""').' as district'),
                DB::raw(($hasSectors ? 'COALESCE(sectors.name, "")' : '""').' as sector'),
                'candidate_profiles.cv_path',
                'candidate_profiles.degree_path',
                'candidate_profiles.certificates_paths'
            );

            return DataTables::of($query)
                ->filter(function($qb) use ($request, $hasProvinces, $hasDistricts, $hasSectors) {
                    $search = $request->input('search.value');
                    if ($search) {
                        $qb->where(function($w) use ($search, $hasProvinces, $hasDistricts, $hasSectors){
                            $w->where('users.first_name','like',"%{$search}%")
                              ->orWhere('users.last_name','like',"%{$search}%")
                              ->orWhere('users.email','like',"%{$search}%")
                              ->orWhere('users.phone','like',"%{$search}%")
                              ->orWhere('candidate_profiles.education_level','like',"%{$search}%");
                            if ($hasProvinces) { $w->orWhere('provinces.name','like',"%{$search}%"); }
                            if ($hasDistricts) { $w->orWhere('districts.name','like',"%{$search}%"); }
                            if ($hasSectors) { $w->orWhere('sectors.name','like',"%{$search}%"); }
                        });
                    }
                })
                ->addColumn('attachments', function($row){
                    $links = [];
                    if (!empty($row->cv_path)) {
                        $links[] = '<a href="'.url('/storage/'.$row->cv_path).'" target="_blank" rel="noreferrer">CV</a>';
                    }
                    if (!empty($row->degree_path)) {
                        $links[] = '<a href="'.url('/storage/'.$row->degree_path).'" target="_blank" rel="noreferrer">Degree</a>';
                    }
                    $certs = [];
                    if (!empty($row->certificates_paths)) {
                        $decoded = is_array($row->certificates_paths) ? $row->certificates_paths : json_decode($row->certificates_paths, true);
                        if (is_array($decoded)) { $certs = array_slice($decoded, 0, 3); }
                    }
                    foreach ($certs as $i => $path) {
                        $links[] = '<a href="'.url('/storage/'.$path).'" target="_blank" rel="noreferrer">Cert '.($i+1).'</a>';
                    }
                    return implode('<br/>', $links);
                })
                ->rawColumns(['attachments'])
                ->toJson();
        } catch (\Throwable $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
