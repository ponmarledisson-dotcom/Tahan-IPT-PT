<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'month',
        'amount',
        'status',
        'due_date',
        'paid_date',
        'payment_method',
        'notes',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}