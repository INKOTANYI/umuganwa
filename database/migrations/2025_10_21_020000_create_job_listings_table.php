<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job_listings')) return;
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('province_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->unsignedBigInteger('sector_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['part_time','full_time','internship','scholarship','tender']);
            $table->date('deadline');
            $table->enum('status', ['open','closed'])->default('open');
            $table->string('salary_range')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'category']);
            $table->index(['province_id','district_id','sector_id']);

            if (Schema::hasTable('companies')) {
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            }
            if (Schema::hasTable('departments')) {
                $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            }
            if (Schema::hasTable('provinces')) {
                $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            }
            if (Schema::hasTable('districts')) {
                $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            }
            if (Schema::hasTable('sectors')) {
                $table->foreign('sector_id')->references('id')->on('sectors')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
