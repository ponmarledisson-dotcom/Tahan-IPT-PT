<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'sex',
        'birthdate',
        'age',
        'contact',
        'email',
        'address',
        'emergency_name',
        'emergency_contact',
        'room_id',
        'status',
    ];
}