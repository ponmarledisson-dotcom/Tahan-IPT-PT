<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    // POST /api/tenants - save new tenant
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'        => 'required|string',
            'last_name'         => 'required|string',
            'sex'               => 'required|in:Male,Female',
            'birthdate'         => 'required|date',
            'age'               => 'required|integer',
            'contact'           => 'required|string',
            'email'             => 'required|email|unique:tenants',
            'address'           => 'required|string',
            'emergency_name'    => 'required|string',
            'emergency_contact' => 'required|string',
            'room_id'           => 'required|integer',
        ]);

        $tenant = Tenant::create($validated);

        return response()->json([
            'message' => 'Application submitted successfully!',
            'tenant'  => $tenant
        ], 201);
    }

    // GET /api/tenants - get all tenants (admin)
    public function index()
    {
        $tenants = Tenant::all();
        return response()->json($tenants);
    }

    // GET /api/tenants/1 - get one tenant
    public function show($id)
    {
        $tenant = Tenant::findOrFail($id);
        return response()->json($tenant);
    }
}