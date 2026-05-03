<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['Private', 'Bedspacer']);
            $table->decimal('price', 10, 2);
            $table->decimal('rating', 3, 1)->default(0);
            $table->boolean('available')->default(true);
            $table->integer('capacity');
            $table->integer('occupied')->default(0);
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->json('rules')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};