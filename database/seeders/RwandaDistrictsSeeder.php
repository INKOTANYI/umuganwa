<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RwandaDistrictsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $jsonPath = database_path('data/rwanda_districts.json');
        if (file_exists($jsonPath)) {
            $json = json_decode(file_get_contents($jsonPath), true);
            if (is_array($json)) {
                $data = $json;
            } else {
                $data = [];
            }
        } else {
            // Fallback minimal data
            $data = [
                'Kigali City' => ['Gasabo', 'Kicukiro', 'Nyarugenge'],
                'Northern' => ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
                'Southern' => ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
                'Eastern' => ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
                'Western' => ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
            ];
        }

        $provinceIds = DB::table('provinces')->pluck('id', 'name');

        foreach ($data as $provinceName => $districts) {
            $provinceId = $provinceIds[$provinceName] ?? null;
            if (!$provinceId) {
                continue;
            }
            foreach ($districts as $name) {
                DB::table('districts')->updateOrInsert(
                    ['province_id' => $provinceId, 'name' => $name],
                    ['province_id' => $provinceId, 'name' => $name, 'created_at' => $now, 'updated_at' => $now]
                );
            }
        }
    }
}
