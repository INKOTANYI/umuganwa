<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('candidate_profiles', 'graduation_date')) {
                $table->date('graduation_date')->nullable()->after('education_level');
            }
            if (!Schema::hasColumn('candidate_profiles', 'experience_years')) {
                $table->unsignedInteger('experience_years')->default(0)->after('graduation_date');
            }
            if (!Schema::hasColumn('candidate_profiles', 'identity_doc_path')) {
                $table->string('identity_doc_path')->nullable()->after('degree_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidate_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('candidate_profiles', 'identity_doc_path')) {
                $table->dropColumn('identity_doc_path');
            }
            if (Schema::hasColumn('candidate_profiles', 'experience_years')) {
                $table->dropColumn('experience_years');
            }
            if (Schema::hasColumn('candidate_profiles', 'graduation_date')) {
                $table->dropColumn('graduation_date');
            }
        });
    }
};
