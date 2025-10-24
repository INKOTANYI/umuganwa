<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('candidate_profiles', 'graduation_date')) {
                $table->date('graduation_date')->nullable()->after('education_level');
            }
            if (!Schema::hasColumn('candidate_profiles', 'experience_years')) {
                // Keep type compatible; use unsignedInteger for broad support
                $table->unsignedInteger('experience_years')->nullable()->after('graduation_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('candidate_profiles', 'experience_years')) {
                $table->dropColumn('experience_years');
            }
            if (Schema::hasColumn('candidate_profiles', 'graduation_date')) {
                $table->dropColumn('graduation_date');
            }
        });
    }
};
