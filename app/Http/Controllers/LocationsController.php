<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Sector;
use Illuminate\Http\Request;

class LocationsController extends Controller
{
    public function districts(Request $request)
    {
        $provinceId = $request->query('province_id');
        if (!$provinceId) {
            return response()->json([], 200);
        }
        $items = District::where('province_id', $provinceId)->orderBy('name')->get(['id','name']);
        return response()->json($items);
    }

    public function sectors(Request $request)
    {
        $districtId = $request->query('district_id');
        if (!$districtId) {
            return response()->json([], 200);
        }
        $items = Sector::where('district_id', $districtId)->orderBy('name')->get(['id','name']);
        return response()->json($items);
    }
}
