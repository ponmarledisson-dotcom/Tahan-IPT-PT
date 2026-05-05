<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // GET /api/payments - tenant sees their own payments
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = Tenant::where('email', $user->email)->first();

        if (!$tenant) {
            return response()->json([]);
        }

        $payments = Payment::where('tenant_id', $tenant->id)
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json($payments);
    }

    // GET /api/admin/payments - admin sees all payments
    public function adminIndex()
    {
        $payments = Payment::with(['tenant', 'user'])
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json($payments);
    }

    // PATCH /api/admin/payments/{id}/mark-paid
    public function markPaid(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status' => 'paid',
            'paid_date' => now()->toDateString(),
            'payment_method' => $request->payment_method ?? 'Cash',
            'notes' => $request->notes,
        ]);

        return response()->json(['message' => 'Payment marked as paid.', 'payment' => $payment]);
    }

    // PATCH /api/admin/payments/{id}/mark-unpaid
    public function markUnpaid($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update([
            'status' => 'unpaid',
            'paid_date' => null,
            'payment_method' => null,
        ]);

        return response()->json(['message' => 'Payment marked as unpaid.', 'payment' => $payment]);
    }

    // POST /api/admin/payments - admin creates a payment record
    public function store(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'user_id'   => 'required|exists:users,id',
            'month'     => 'required|string',
            'amount'    => 'required|numeric',
            'due_date'  => 'required|date',
        ]);

        $payment = Payment::create($request->all());

        return response()->json(['message' => 'Payment record created.', 'payment' => $payment], 201);
    }
}