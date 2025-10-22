<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('job_listings')) return;
        Schema::table('job_listings', function (Blueprint $table) {
            if (!Schema::hasColumn('job_listings','education_level')) {
                $table->string('education_level')->nullable()->after('description');
            }
            if (!Schema::hasColumn('job_listings','qualifications')) {
                $table->text('qualifications')->nullable()->after('education_level');
            }
            if (!Schema::hasColumn('job_listings','experience_years')) {
                $table->unsignedSmallInteger('experience_years')->nullable()->after('qualifications');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('job_listings')) return;
        Schema::table('job_listings', function (Blueprint $table) {
            foreach (['education_level','qualifications','experience_years'] as $col) {
                try { $table->dropColumn($col); } catch (\Throwable $e) {}
            }
        });
    }
};
