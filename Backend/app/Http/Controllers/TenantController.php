<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    // POST /api/tenants - save new tenant application
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
            'tenant'  => $tenant,
        ], 201);
    }

    // GET /api/tenants
    public function index()
    {
        return response()->json(Tenant::all());
    }

    // GET /api/tenants/{id}
    public function show($id)
    {
        return response()->json(Tenant::findOrFail($id));
    }

    // GET /api/profile
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // POST /api/profile/update
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'name'                     => 'required|string|max:255',
            'email'                    => 'required|email|unique:users,email,' . $user->id,
            'gender'                   => 'nullable|in:Male,Female,Other',
            'contact_number'           => 'required|string|max:20',
            'emergency_contact_name'   => 'required|string|max:255',
            'emergency_contact_number' => 'required|string|max:20',
        ]);
        $user->update($request->only([
            'name', 'email', 'gender',
            'contact_number', 'emergency_contact_name', 'emergency_contact_number',
        ]));
        return response()->json(['message' => 'Profile updated successfully.', 'user' => $user]);
    }

    // GET /api/dashboard
    public function dashboard(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user'    => $user,
            'message' => 'Welcome to your dashboard, ' . $user->name . '!',
        ]);
    }

    // GET /api/my-application ← ADDED: tenant sees their own application status
    public function myApplication(Request $request)
    {
        $user   = $request->user();
        $tenant = Tenant::where('email', $user->email)->latest()->first();

        if (!$tenant) {
            return response()->json(null);
        }

        // Use room name map since your rooms are in the DB
        $roomNames = [
            1 => 'Room 101', 2 => 'Room 102', 3 => 'Room 103',
            4 => 'Room 201', 5 => 'Room 202', 6 => 'Room 301',
            7 => 'Room 302', 8 => 'Room 303', 9 => 'Room 304',
        ];

        return response()->json([
            'id'           => $tenant->id,
            'first_name'   => $tenant->first_name,
            'last_name'    => $tenant->last_name,
            'room_id'      => $tenant->room_id,
            'status'       => $tenant->status,
            'move_in_date' => $tenant->move_in_date,
            'room'         => [
                'name' => $roomNames[$tenant->room_id] ?? 'Room ' . $tenant->room_id,
                'type' => null,
            ],
        ]);
    }
} 
