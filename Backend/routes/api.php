<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

// ── Rooms (public) ────────────────────────────────────────────────────────────
Route::get('/rooms',      [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// ── Tenants / Application form (public) ───────────────────────────────────────
Route::get('/tenants',      [TenantController::class, 'index']);
Route::get('/tenants/{id}', [TenantController::class, 'show']);
Route::post('/tenants',     [TenantController::class, 'store']);

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected routes (requires login token) ───────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Tenant profile
    Route::get('/profile',         [TenantController::class, 'profile']);
    Route::post('/profile/update', [TenantController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [TenantController::class, 'dashboard']);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::get('/admin/tenants',                   [AdminController::class, 'allTenants']);
        Route::get('/admin/tenants/{id}',              [AdminController::class, 'getTenant']);
        Route::put('/admin/tenants/{id}',              [AdminController::class, 'updateTenant']);
        Route::patch('/admin/tenants/{id}/deactivate', [AdminController::class, 'deactivate']);
        Route::patch('/admin/tenants/{id}/activate',   [AdminController::class, 'activate']);
    });
});