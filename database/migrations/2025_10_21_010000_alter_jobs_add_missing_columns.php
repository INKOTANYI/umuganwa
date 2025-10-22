<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('jobs')) {
            return; // nothing to alter
        }
        Schema::table('jobs', function (Blueprint $table) {
            // Foreign keys and references (nullable to be safe when backfilling)
            if (!Schema::hasColumn('jobs', 'company_id')) {
                $table->unsignedBigInteger('company_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('jobs', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('company_id');
            }
            if (!Schema::hasColumn('jobs', 'province_id')) {
                $table->unsignedBigInteger('province_id')->nullable()->after('department_id');
            }
            if (!Schema::hasColumn('jobs', 'district_id')) {
                $table->unsignedBigInteger('district_id')->nullable()->after('province_id');
            }
            if (!Schema::hasColumn('jobs', 'sector_id')) {
                $table->unsignedBigInteger('sector_id')->nullable()->after('district_id');
            }

            if (!Schema::hasColumn('jobs', 'title')) {
                $table->string('title')->default('')->after('sector_id');
            }
            if (!Schema::hasColumn('jobs', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('jobs', 'category')) {
                $table->enum('category', ['part_time','full_time','internship','scholarship','tender'])->nullable()->after('description');
            }
            if (!Schema::hasColumn('jobs', 'deadline')) {
                $table->date('deadline')->nullable()->after('category');
            }
            if (!Schema::hasColumn('jobs', 'status')) {
                $table->enum('status', ['open','closed'])->default('open')->after('deadline');
            }
            if (!Schema::hasColumn('jobs', 'salary_range')) {
                $table->string('salary_range')->nullable()->after('status');
            }
            // indexes
            if (!Schema::hasColumn('jobs', 'company_id')) return; // guard
            $table->index(['company_id', 'category'], 'jobs_company_category_idx');
            $table->index(['province_id','district_id','sector_id'], 'jobs_location_idx');
        });

        // Add foreign keys in a separate call to avoid issues on some DBs
        Schema::table('jobs', function (Blueprint $table) {
            try { if (Schema::hasTable('companies') && Schema::hasColumn('jobs','company_id')) $table->foreign('company_id')->references('id')->on('companies')->nullOnDelete(); } catch (\Throwable $e) {}
            try { if (Schema::hasTable('departments') && Schema::hasColumn('jobs','department_id')) $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete(); } catch (\Throwable $e) {}
            try { if (Schema::hasTable('provinces') && Schema::hasColumn('jobs','province_id')) $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete(); } catch (\Throwable $e) {}
            try { if (Schema::hasTable('districts') && Schema::hasColumn('jobs','district_id')) $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete(); } catch (\Throwable $e) {}
            try { if (Schema::hasTable('sectors') && Schema::hasColumn('jobs','sector_id')) $table->foreign('sector_id')->references('id')->on('sectors')->nullOnDelete(); } catch (\Throwable $e) {}
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('jobs')) return;
        Schema::table('jobs', function (Blueprint $table) {
            // drop FKs if exist
            foreach (['company_id','department_id','province_id','district_id','sector_id'] as $col) {
                $fk = 'jobs_'.$col.'_foreign';
                try { $table->dropForeign($fk); } catch (\Throwable $e) {}
            }
            // drop indexes
            try { $table->dropIndex('jobs_company_category_idx'); } catch (\Throwable $e) {}
            try { $table->dropIndex('jobs_location_idx'); } catch (\Throwable $e) {}
            // drop added columns
            foreach (['company_id','department_id','province_id','district_id','sector_id','title','description','category','deadline','status','salary_range'] as $col) {
                try { $table->dropColumn($col); } catch (\Throwable $e) {}
            }
        });
    }
};
