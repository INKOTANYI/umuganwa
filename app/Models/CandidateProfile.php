<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'gender',
        'short_bio', 'skills',
        'education_level', 'languages',
        'graduation_date', 'experience_years',
        'province_id', 'district_id', 'sector_id', 'address_line', 'department_id',
        'cv_path', 'degree_path', 'certificates_paths', 'identity_doc_path',
    ];

    protected $casts = [
        'languages' => 'array',
        'certificates_paths' => 'array',
        'date_of_birth' => 'date',
        'graduation_date' => 'date',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function province() { return $this->belongsTo(Province::class); }
    public function district() { return $this->belongsTo(District::class); }
    public function sector() { return $this->belongsTo(Sector::class); }
    public function department() { return $this->belongsTo(Department::class); }
}
