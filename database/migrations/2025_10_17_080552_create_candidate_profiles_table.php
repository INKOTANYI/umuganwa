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
        Schema::create('candidate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();

            // Prefilled identity/contact (editable via Edit only)
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');

            // Personal
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);

            // Summary and skills
            $table->text('short_bio');
            $table->text('skills')->nullable(); // free text/tags

            // Education level
            $table->enum('education_level', ['phd', 'masters', 'bachelor', 'secondary', 'certificates']);

            // Languages (multiple)
            $table->json('languages'); // e.g., ["english","french","kinyarwanda","swahili"]

            // Location
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
            $table->foreignId('sector_id')->constrained('sectors')->cascadeOnDelete();
            $table->string('address_line')->nullable();

            // Documents
            $table->string('cv_path')->nullable();
            $table->string('degree_path')->nullable();
            $table->json('certificates_paths')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_profiles');
    }
};
