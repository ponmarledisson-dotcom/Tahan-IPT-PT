<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Tenant;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    // GET /api/maintenance — tenant sees their own requests
    public function index(Request $request)
    {
        $requests = Maintenance::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    // POST /api/maintenance — tenant submits a request
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'photo'       => 'nullable|image|max:2048',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('maintenance', 'public');
        }

        // Find tenant record linked to this user
        $tenant = Tenant::where('email', $request->user()->email)->first();

        $maintenance = Maintenance::create([
            'user_id'     => $request->user()->id,
            'tenant_id'   => $tenant?->id,
            'title'       => $request->title,
            'description' => $request->description,
            'photo'       => $photoPath,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message'     => 'Maintenance request submitted.',
            'maintenance' => $maintenance,
        ], 201);
    }

    // GET /api/admin/maintenance — admin sees all requests
    public function adminIndex()
    {
        $requests = Maintenance::with(['user', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    // PATCH /api/admin/maintenance/{id}/respond — admin responds
    public function respond(Request $request, $id)
    {
        $request->validate([
            'status'         => 'required|in:pending,in_progress,resolved',
            'admin_response' => 'nullable|string',
        ]);

        $maintenance = Maintenance::findOrFail($id);
        $maintenance->update([
            'status'         => $request->status,
            'admin_response' => $request->admin_response,
        ]);

        return response()->json([
            'message'     => 'Response saved.',
            'maintenance' => $maintenance,
        ]);
    }
}