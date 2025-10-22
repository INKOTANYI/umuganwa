<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $table = 'job_listings';

    protected $fillable = [
        'company_id',
        'department_id',
        'province_id',
        'district_id',
        'sector_id',
        'title',
        'description',
        'education_level',
        'experience_years',
        'category',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    // Relationships
    public function company() { return $this->belongsTo(Company::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function province() { return $this->belongsTo(Province::class); }
    public function district() { return $this->belongsTo(District::class); }
    public function sector() { return $this->belongsTo(Sector::class); }
}
