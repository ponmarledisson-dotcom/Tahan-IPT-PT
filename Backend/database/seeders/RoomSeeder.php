<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing rooms
        DB::table('rooms')->truncate();

        $rooms = [
            // ── BOYS ONLY — Available ─────────────────────────────────────────
            [
                'name' => 'Room 101', 'type' => 'Private', 'gender_type' => 'Male Only',
                'price' => 4500, 'rating' => 4.5, 'available' => true, 'capacity' => 1, 'occupied' => 0,
                'image' => '/room1.jpg',
                'description' => 'A private room exclusively for male tenants. Well-ventilated with air conditioning and a study desk.',
                'amenities' => ['WiFi', 'Air conditioning', 'Study desk', 'Wardrobe'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM', 'No smoking'],
            ],
            [
                'name' => 'Room 103', 'type' => 'Bedspacer', 'gender_type' => 'Male Only',
                'price' => 2500, 'rating' => 4.1, 'available' => true, 'capacity' => 6, 'occupied' => 3,
                'image' => '/room1.jpg',
                'description' => 'Affordable boys-only bedspace with shared bathroom and secure lockers.',
                'amenities' => ['WiFi', 'Fan', 'Shared bathroom', 'Locker'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM', 'Keep area clean'],
            ],

            // ── GIRLS ONLY — Available ────────────────────────────────────────
            [
                'name' => 'Room 201', 'type' => 'Private', 'gender_type' => 'Female Only',
                'price' => 4500, 'rating' => 4.7, 'available' => true, 'capacity' => 1, 'occupied' => 0,
                'image' => '/room2.jpeg',
                'description' => 'A cozy private room for female tenants. Bright, secure, and fully furnished.',
                'amenities' => ['WiFi', 'Air conditioning', 'Private bathroom', 'Wardrobe'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM', 'No smoking'],
            ],
            [
                'name' => 'Room 203', 'type' => 'Bedspacer', 'gender_type' => 'Female Only',
                'price' => 2500, 'rating' => 4.3, 'available' => true, 'capacity' => 5, 'occupied' => 2,
                'image' => '/room2.jpeg',
                'description' => 'Girls-only bedspace on the 2nd floor with study area and natural light.',
                'amenities' => ['WiFi', 'Fan', 'Shared bathroom', 'Study desk'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM', 'No loud music'],
            ],

            // ── MIXED — Available ─────────────────────────────────────────────
            [
                'name' => 'Room 301', 'type' => 'Private', 'gender_type' => 'Mixed',
                'price' => 5000, 'rating' => 4.7, 'available' => true, 'capacity' => 1, 'occupied' => 0,
                'image' => '/room1.jpg',
                'description' => 'Premium private room on the top floor. Open to all genders with full amenities.',
                'amenities' => ['WiFi', 'Air conditioning', 'Private bathroom', 'Ref', 'TV'],
                'rules' => ['No smoking', 'No pets', 'No overnight visitors'],
            ],
            [
                'name' => 'Room 303', 'type' => 'Bedspacer', 'gender_type' => 'Mixed',
                'price' => 2000, 'rating' => 4.0, 'available' => true, 'capacity' => 6, 'occupied' => 2,
                'image' => '/room2.jpeg',
                'description' => 'Mixed bedspace near the common area. Great for students on a budget.',
                'amenities' => ['WiFi', 'Fan', 'Shared bathroom'],
                'rules' => ['Curfew at 11PM', 'No loud music after 10PM'],
            ],

            // ── FULLY OCCUPIED — 1 per gender ────────────────────────────────
            [
                'name' => 'Room 102', 'type' => 'Bedspacer', 'gender_type' => 'Male Only',
                'price' => 2000, 'rating' => 4.2, 'available' => false, 'capacity' => 5, 'occupied' => 5,
                'image' => '/room1.jpg',
                'description' => 'Boys-only bedspace. Currently fully occupied.',
                'amenities' => ['WiFi', 'Fan', 'Shared bathroom', 'Locker'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM'],
            ],
            [
                'name' => 'Room 202', 'type' => 'Private', 'gender_type' => 'Female Only',
                'price' => 4500, 'rating' => 4.6, 'available' => false, 'capacity' => 1, 'occupied' => 1,
                'image' => '/room2.jpeg',
                'description' => 'Girls-only private room. Currently fully occupied.',
                'amenities' => ['WiFi', 'Air conditioning', 'Private bathroom'],
                'rules' => ['No overnight visitors', 'Curfew at 10PM'],
            ],
            [
                'name' => 'Room 302', 'type' => 'Bedspacer', 'gender_type' => 'Mixed',
                'price' => 2000, 'rating' => 4.4, 'available' => false, 'capacity' => 4, 'occupied' => 4,
                'image' => '/room1.jpg',
                'description' => 'Mixed bedspace. Currently fully occupied.',
                'amenities' => ['WiFi', 'Fan', 'Shared bathroom'],
                'rules' => ['Curfew at 10PM', 'No loud music'],
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}