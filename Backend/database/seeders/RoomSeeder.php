<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        Room::create([
            'name'        => 'Room 101',
            'type'        => 'Private',
            'price'       => 3500,
            'rating'      => 4.5,
            'available'   => true,
            'capacity'    => 5,
            'occupied'    => 3,
            'image'       => '/room1.jpg',
            'description' => 'A cozy private room perfect for students and working professionals.',
            'amenities'   => ['WiFi included', 'Air conditioning', 'Private bathroom', 'Cabinet and study table'],
            'rules'       => ['No smoking inside', 'No overnight visitors', 'Curfew at 10PM', 'Keep common areas clean'],
        ]);

        Room::create([
            'name'        => 'Room 102',
            'type'        => 'Bedspacer',
            'price'       => 1500,
            'rating'      => 4.2,
            'available'   => false,
            'capacity'    => 5,
            'occupied'    => 5,
            'image'       => '/room1.jpg',
            'description' => 'Affordable bedspace ideal for students on a budget.',
            'amenities'   => ['WiFi included', 'Shared bathroom', 'Locker provided'],
            'rules'       => ['No smoking inside', 'No overnight visitors', 'Curfew at 10PM'],
        ]);

        Room::create([
            'name'        => 'Room 103',
            'type'        => 'Private',
            'price'       => 4000,
            'rating'      => 4.8,
            'available'   => true,
            'capacity'    => 5,
            'occupied'    => 1,
            'image'       => '/room1.jpg',
            'description' => 'A spacious private room with complete amenities.',
            'amenities'   => ['WiFi included', 'Air conditioning', 'Private bathroom', 'Ref and microwave'],
            'rules'       => ['No smoking inside', 'No overnight visitors', 'Curfew at 10PM'],
        ]);
    }
}