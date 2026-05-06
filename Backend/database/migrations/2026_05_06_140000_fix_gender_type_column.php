<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change gender_type to a plain string so all values fit
        DB::statement("ALTER TABLE rooms MODIFY gender_type VARCHAR(20) NOT NULL DEFAULT 'Mixed'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE rooms MODIFY gender_type ENUM('Male Only', 'Female Only', 'Mixed') NOT NULL DEFAULT 'Mixed'");
    }
};