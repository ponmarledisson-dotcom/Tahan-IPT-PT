<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $fillable = [
        'user_id',
        'tenant_id',
        'title',
        'description',
        'photo',
        'status',
        'admin_response',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}