<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RwandaSectorsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $jsonPath = database_path('data/rwanda_sectors.json');
        $data = [];
        if (file_exists($jsonPath)) {
            $json = json_decode(file_get_contents($jsonPath), true);
            if (is_array($json)) {
                // Prefer known nested structures first
                $containers = [];
                if (isset($json['items']) && is_array($json['items'])) {
                    $containers = $json['items'];
                } elseif (isset($json['provinces']) && is_array($json['provinces'])) {
                    $containers = $json['provinces'];
                }

                if (!empty($containers)) {
                    foreach ($containers as $province) {
                        $districts = $province['districts'] ?? [];
                        foreach ($districts as $district) {
                            $districtName = $district['name'] ?? null;
                            if (!$districtName) continue;
                            $sectors = $district['sectors'] ?? [];
                            foreach ($sectors as $sector) {
                                $sectorName = is_array($sector) ? ($sector['name'] ?? null) : $sector;
                                if (!$sectorName) continue;
                                $data[$districtName] = $data[$districtName] ?? [];
                                if (!in_array($sectorName, $data[$districtName], true)) {
                                    $data[$districtName][] = $sectorName;
                                }
                            }
                        }
                    }
                } else {
                    // Maybe it's already a district->sectors map of strings
                    $looksLikeMap = true;
                    foreach ($json as $k => $v) {
                        if (!is_array($v)) { $looksLikeMap = false; break; }
                        // ensure first element is a string when present
                        $first = reset($v);
                        if ($first !== false && !is_string($first)) { $looksLikeMap = false; break; }
                    }
                    if ($looksLikeMap) {
                        $data = $json;
                    }
                }
            }
        }

        // If local mapping not available, try to fetch a public dataset and derive mapping
        if (empty($data)) {
            $remoteUrl = 'https://raw.githubusercontent.com/ShejaEddy/Rwanda-Provinces-Districts-Sectors-Cell-Villages/main/data.json';
            try {
                $raw = @file_get_contents($remoteUrl);
                if ($raw !== false) {
                    $decoded = json_decode($raw, true);
                    // Expected high-level structure: provinces -> [ { name, districts: [ { name, sectors: [ { name, ... } ] } ] } ]
                    if (is_array($decoded)) {
                        // Detect structure variants
                        $provincesArray = $decoded['provinces'] ?? $decoded; // handle if file is just an array
                        if (is_array($provincesArray)) {
                            foreach ($provincesArray as $province) {
                                $districts = $province['districts'] ?? [];
                                foreach ($districts as $district) {
                                    $districtName = $district['name'] ?? null;
                                    if (!$districtName) continue;
                                    $sectors = $district['sectors'] ?? [];
                                    foreach ($sectors as $sector) {
                                        $sectorName = is_array($sector) ? ($sector['name'] ?? null) : $sector;
                                        if (!$sectorName) continue;
                                        $data[$districtName] = $data[$districtName] ?? [];
                                        if (!in_array($sectorName, $data[$districtName], true)) {
                                            $data[$districtName][] = $sectorName;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                // ignore network errors and fallback below
            }
        }

        // Fallback minimal sample if still empty
        if (empty($data)) {
            $data = [
                'Gasabo' => ['Kimironko', 'Remera', 'Kacyiru', 'Rusororo'],
                'Kicukiro' => ['Kagarama', 'Kanombe', 'Kigarama', 'Gahanga'],
                'Nyarugenge' => ['Nyarugenge', 'Nyamirambo', 'Gitega', 'Kimisagara'],
            ];
        }

        $districtIds = DB::table('districts')->pluck('id', 'name');
        $inserted = 0; $skipped = 0;

        foreach ($data as $districtName => $sectors) {
            $districtId = $districtIds[$districtName] ?? null;
            if (!$districtId) {
                $skipped++;
                continue;
            }
            foreach ($sectors as $name) {
                DB::table('sectors')->updateOrInsert(
                    ['district_id' => $districtId, 'name' => $name],
                    ['district_id' => $districtId, 'name' => $name, 'created_at' => $now, 'updated_at' => $now]
                );
                $inserted++;
            }
        }
        if ($inserted === 0) {
            echo "RwandaSectorsSeeder: Inserted=0, SkippedDistricts={$skipped}. Check JSON structure and district names.\n";
        } else {
            echo "RwandaSectorsSeeder: Inserted={$inserted}, SkippedDistricts={$skipped}.\n";
        }
    }
}
