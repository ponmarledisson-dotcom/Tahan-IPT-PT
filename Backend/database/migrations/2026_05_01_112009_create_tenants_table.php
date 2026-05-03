<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('sex', ['Male', 'Female']);
            $table->date('birthdate');
            $table->integer('age');
            $table->string('contact');
            $table->string('email')->unique();
            $table->string('address');
            $table->string('emergency_name');
            $table->string('emergency_contact');
            $table->unsignedBigInteger('room_id')->nullable();
            $table->enum('status', ['active', 'moved_out', 'pending'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};