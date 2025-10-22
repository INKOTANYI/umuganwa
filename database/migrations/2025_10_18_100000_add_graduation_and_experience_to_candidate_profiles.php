<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            $table->date('graduation_date')->nullable()->after('education_level');
            $table->unsignedSmallInteger('experience_years')->nullable()->after('graduation_date');
        });
    }

    public function down(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            $table->dropColumn(['graduation_date', 'experience_years']);
        });
    }
};
