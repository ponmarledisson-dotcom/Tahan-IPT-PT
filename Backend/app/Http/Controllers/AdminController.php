<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/tenants
    public function allTenants()
    {
        $tenants = User::where('role', 'tenant')
            ->select('id', 'name', 'email', 'gender', 'contact_number', 'status', 'created_at', 'profile_photo')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tenants);
    }

    // GET /api/admin/tenants/{id}
    public function getTenant($id)
    {
        $tenant = User::where('role', 'tenant')->findOrFail($id);
        return response()->json($tenant);
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

        return response()->json([
            'message' => 'Tenant updated successfully.',
            'tenant'  => $tenant,
        ]);
    }

    // PATCH /api/admin/tenants/{id}/deactivate
    public function deactivate($id)
    {
        $tenant = User::where('role', 'tenant')->findOrFail($id);
        $tenant->update(['status' => 'inactive']);

        return response()->json(['message' => 'Tenant account deactivated.']);
    }

    // PATCH /api/admin/tenants/{id}/activate
    public function activate($id)
    {
        $tenant = User::where('role', 'tenant')->findOrFail($id);
        $tenant->update(['status' => 'active']);

        return response()->json(['message' => 'Tenant account activated.']);
    }
}