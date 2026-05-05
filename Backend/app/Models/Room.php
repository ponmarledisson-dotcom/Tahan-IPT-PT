<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'name',
        'gender',
        'type',
        'price',
        'rating',
        'available',
        'capacity',
        'occupied',
        'image',
        'description',
        'amenities',
        'rules',
    ];

    protected $casts = [
        'amenities' => 'array',
        'rules'     => 'array',
        'available' => 'boolean',
    ];
}