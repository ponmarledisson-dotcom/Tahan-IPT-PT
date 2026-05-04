<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // These columns are added to Laravel's default users table
            $table->string('gender')->nullable()->after('name');
            $table->string('contact_number')->nullable()->after('gender');
            $table->string('emergency_contact_name')->nullable()->after('contact_number');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
            $table->string('profile_photo')->nullable()->after('emergency_contact_number');
            $table->boolean('agreed_to_terms')->default(false)->after('profile_photo');
            $table->enum('role', ['tenant', 'admin'])->default('tenant')->after('agreed_to_terms');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'contact_number',
                'emergency_contact_name',
                'emergency_contact_number',
                'profile_photo',
                'agreed_to_terms',
                'role',
                'status',
            ]);
        });
    }
};
