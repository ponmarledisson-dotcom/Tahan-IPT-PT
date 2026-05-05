<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Room;
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
            'room_id'           => 'nullable|integer',
        ]);

        // No room selected — skip tenant record creation entirely
        if (empty($validated['room_id'])) {
            return response()->json([
                'message' => 'No room selected. Account will be created only.',
            ], 200);
        }

        // Room/gender check
        $room = Room::find($validated['room_id']);

        if (!$room) {
            return response()->json(['message' => 'Room not found.'], 404);
        }

        if ($room->gender !== 'Mixed' && $room->gender !== $validated['sex']) {
            return response()->json([
                'message' => 'This room is for ' . $room->gender . ' tenants only.',
            ], 422);
        }

        $tenant = Tenant::create($validated);

        return response()->json([
            'message' => 'Application submitted successfully!',
            'tenant'  => $tenant,
        ], 201);
    }

    // GET /api/tenants - get all tenants (admin)
    public function index()
    {
        $tenants = Tenant::all();
        return response()->json($tenants);
    }

    // GET /api/tenants/{id} - get one tenant
    public function show($id)
    {
        $tenant = Tenant::findOrFail($id);
        return response()->json($tenant);
    }

    // GET /api/profile - returns logged-in user's profile
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // POST /api/profile/update - tenant updates their own profile
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
            'profile_photo'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo && file_exists(public_path('uploads/' . $user->profile_photo))) {
                unlink(public_path('uploads/' . $user->profile_photo));
            }

            $file = $request->file('profile_photo');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $user->profile_photo = $filename;
        }

        $user->update([
            'name'                     => $request->name,
            'email'                    => $request->email,
            'gender'                   => $request->gender,
            'contact_number'           => $request->contact_number,
            'emergency_contact_name'   => $request->emergency_contact_name,
            'emergency_contact_number' => $request->emergency_contact_number,
            'profile_photo'            => $user->profile_photo,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user,
        ]);
    }

    // GET /api/dashboard - tenant dashboard data
    public function dashboard(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user'    => $user,
            'message' => 'Welcome to your dashboard, ' . $user->name . '!',
        ]);
    }
}