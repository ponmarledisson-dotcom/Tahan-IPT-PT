<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Room name map (kept from your original)
    private array $roomNames = [
        1 => 'Room 101',
        2 => 'Room 102',
        3 => 'Room 103',
        4 => 'Room 201',
        5 => 'Room 202',
        6 => 'Room 301',
        7 => 'Room 302',
        8 => 'Room 303',
        9 => 'Room 304',
    ];

    // GET /api/admin/tenants
    public function allTenants()
    {
        return response()->json(
            User::where('role', 'tenant')
                ->select('id', 'name', 'email', 'gender', 'contact_number', 'status', 'created_at', 'profile_photo')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    // GET /api/admin/tenants/{id}
    public function getTenant($id)
    {
        return response()->json(User::where('role', 'tenant')->findOrFail($id));
    }

    // PUT /api/admin/tenants/{id}
    public function updateTenant(Request $request, $id)
    {
        $tenant = User::where('role', 'tenant')->findOrFail($id);
        $request->validate([
            'name'                     => 'sometimes|string|max:255',
            'email'                    => 'sometimes|email|unique:users,email,' . $id,
            'gender'                   => 'sometimes|in:Male,Female,Other',
            'contact_number'           => 'sometimes|string|max:20',
            'emergency_contact_name'   => 'sometimes|string|max:255',
            'emergency_contact_number' => 'sometimes|string|max:20',
        ]);
        $tenant->update($request->only([
            'name', 'email', 'gender',
            'contact_number', 'emergency_contact_name', 'emergency_contact_number',
        ]));
        return response()->json(['message' => 'Tenant updated successfully.', 'tenant' => $tenant]);
    }

    // PATCH /api/admin/tenants/{id}/deactivate
    public function deactivate($id)
    {
        User::where('role', 'tenant')->findOrFail($id)->update(['status' => 'inactive']);
        return response()->json(['message' => 'Tenant account deactivated.']);
    }

    // PATCH /api/admin/tenants/{id}/activate
    public function activate($id)
    {
        User::where('role', 'tenant')->findOrFail($id)->update(['status' => 'active']);
        return response()->json(['message' => 'Tenant account activated.']);
    }

    // GET /api/admin/applications
    public function allApplications()
    {
        $applications = Tenant::orderBy('created_at', 'desc')->get();

        $applications->transform(function ($app) {
            // Use room relationship if available, fall back to name map
            $roomName = $this->roomNames[$app->room_id] ?? 'Room ' . $app->room_id;
            $app->room = [
                'name'  => $roomName,
                'type'  => null,
                'price' => null,
            ];
            return $app;
        });

        return response()->json($applications);
    }

    // PATCH /api/admin/applications/{id}/approve
    public function approveApplication(Request $request, $id)
    {
        $request->validate(['move_in_date' => 'required|date']);

        $tenant = Tenant::findOrFail($id);
        $tenant->update([
            'status'       => 'approved',
            'move_in_date' => $request->move_in_date,
        ]);

        // Also activate their user account
        User::where('email', $tenant->email)->update(['status' => 'active']);

        return response()->json(['message' => 'Application approved.', 'tenant' => $tenant]);
    }

    // PATCH /api/admin/applications/{id}/reject
    public function rejectApplication($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'rejected']);
        return response()->json(['message' => 'Application rejected.', 'tenant' => $tenant]);
    }
}