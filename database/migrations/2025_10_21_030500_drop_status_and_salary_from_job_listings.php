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
            if (Schema::hasColumn('job_listings', 'status')) {
                try { $table->dropColumn('status'); } catch (\Throwable $e) {}
            }
            if (Schema::hasColumn('job_listings', 'salary_range')) {
                try { $table->dropColumn('salary_range'); } catch (\Throwable $e) {}
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('job_listings')) return;
        Schema::table('job_listings', function (Blueprint $table) {
            if (!Schema::hasColumn('job_listings','status')) {
                $table->enum('status', ['open','closed'])->default('open')->after('deadline');
            }
            if (!Schema::hasColumn('job_listings','salary_range')) {
                $table->string('salary_range')->nullable()->after('status');
            }
        });
    }
};
