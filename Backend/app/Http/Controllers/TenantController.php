<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Room;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    // Room name map — matches seeded room IDs
    private array $roomNames = [
        1 => 'Room 101',
        2 => 'Room 103',
        3 => 'Room 201',
        4 => 'Room 203',
        5 => 'Room 301',
        6 => 'Room 303',
        7 => 'Room 102',
        8 => 'Room 202',
        9 => 'Room 302',
    ];

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

        // No room selected — skip tenant record creation
        if (empty($validated['room_id'])) {
            return response()->json([
                'message' => 'No room selected. Account will be created only.',
            ], 200);
        }

        // Find the room
        $room = Room::find($validated['room_id']);

        if (!$room) {
            return response()->json(['message' => 'Room not found.'], 404);
        }

        // ── Gender compatibility check ────────────────────────────────────
        if ($room->gender_type === 'Male Only' && $validated['sex'] !== 'Male') {
            return response()->json([
                'message' => 'This room is for male tenants only.',
                'errors'  => ['room_id' => ['This room is Boys Only. Female applicants are not allowed.']],
            ], 422);
        }

        if ($room->gender_type === 'Female Only' && $validated['sex'] !== 'Female') {
            return response()->json([
                'message' => 'This room is for female tenants only.',
                'errors'  => ['room_id' => ['This room is Girls Only. Male applicants are not allowed.']],
            ], 422);
        }

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
            'profile_photo'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo && file_exists(public_path('uploads/' . $user->profile_photo))) {
                unlink(public_path('uploads/' . $user->profile_photo));
            }
            $file     = $request->file('profile_photo');
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

    // GET /api/dashboard
    public function dashboard(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user'    => $user,
            'message' => 'Welcome to your dashboard, ' . $user->name . '!',
        ]);
    }

    // GET /api/my-application — tenant sees their own application status
    public function myApplication(Request $request)
    {
        $user   = $request->user();
        $tenant = Tenant::where('email', $user->email)->latest()->first();

        if (!$tenant) {
            return response()->json(null);
        }

        $roomName = $this->roomNames[$tenant->room_id]
            ?? ($tenant->room_id ? 'Room ' . $tenant->room_id : 'Unknown Room');

        return response()->json([
            'id'           => $tenant->id,
            'first_name'   => $tenant->first_name,
            'last_name'    => $tenant->last_name,
            'room_id'      => $tenant->room_id,
            'status'       => $tenant->status,
            'move_in_date' => $tenant->move_in_date,
            'room'         => [
                'name' => $roomName,
                'type' => $tenant->room_id ? (Room::find($tenant->room_id)?->type ?? '') : '',
            ],
        ]);
    }

    // POST /api/apply-room — logged-in tenant applies for a room
    public function applyRoom(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'room_id' => 'required|integer|exists:rooms,id',
        ]);

        // Check if already has a pending/approved application
        $existing = Tenant::where('email', $user->email)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already have an active application.',
            ], 422);
        }

        // Room gender check
        $room       = Room::find($validated['room_id']);
        $userGender = $user->gender ?? 'Mixed';

        if ($room->gender_type === 'Male Only' && $userGender !== 'Male') {
            return response()->json([
                'message' => 'This room is Boys Only. Female applicants are not allowed.',
                'errors'  => ['room_id' => ['This room is for male tenants only.']],
            ], 422);
        }

        if ($room->gender_type === 'Female Only' && $userGender !== 'Female') {
            return response()->json([
                'message' => 'This room is Girls Only. Male applicants are not allowed.',
                'errors'  => ['room_id' => ['This room is for female tenants only.']],
            ], 422);
        }

        $nameParts = explode(' ', $user->name, 2);
        $firstName = $nameParts[0];
        $lastName  = $nameParts[1] ?? '-';

        $tenant = Tenant::create([
            'first_name'        => $firstName,
            'last_name'         => $lastName,
            'sex'               => $user->gender ?? 'Male',
            'birthdate'         => '2000-01-01',
            'age'               => 20,
            'contact'           => $user->contact_number ?? '-',
            'email'             => $user->email,
            'address'           => '-',
            'emergency_name'    => $user->emergency_contact_name ?? '-',
            'emergency_contact' => $user->emergency_contact_number ?? '-',
            'room_id'           => $validated['room_id'],
            'status'            => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully!',
            'tenant'  => $tenant,
        ], 201);
    }
}