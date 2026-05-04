<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ── Register ──────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'full_name'                => 'required|string|max:255',
            'email'                    => 'required|email|unique:users,email',
            'password'                 => 'required|string|min:8|confirmed',
            'gender'                   => 'required|in:Male,Female,Other',
            'contact_number'           => 'required|string|max:20',
            'emergency_contact_name'   => 'required|string|max:255',
            'emergency_contact_number' => 'required|string|max:20',
            'agreed_to_terms'          => 'required|accepted',
            'profile_photo'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Handle profile photo upload
        $photoPath = null;
        if ($request->hasFile('profile_photo')) {
            $photoPath = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        $user = User::create([
            'name'                     => $request->full_name,
            'email'                    => $request->email,
            'password'                 => Hash::make($request->password),
            'gender'                   => $request->gender,
            'contact_number'           => $request->contact_number,
            'emergency_contact_name'   => $request->emergency_contact_name,
            'emergency_contact_number' => $request->emergency_contact_number,
            'agreed_to_terms'          => true,
            'profile_photo'            => $photoPath,
            'role'                     => 'tenant', // default role
            'status'                   => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ], 201);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact the landlord.',
            ], 403);
        }

        // Revoke old tokens (single session)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ── Get current user ──────────────────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}