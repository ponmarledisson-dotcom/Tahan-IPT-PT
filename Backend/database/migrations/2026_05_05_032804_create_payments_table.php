<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('month'); // e.g. "May 2026"
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->string('payment_method')->nullable(); // GCash, Card, Cash
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};