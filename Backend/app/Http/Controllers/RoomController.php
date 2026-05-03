<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // GET /api/rooms - get all rooms
    public function index()
    {
        $rooms = Room::all();
        return response()->json($rooms);
    }

    // GET /api/rooms/1 - get one room
    public function show($id)
    {
        $room = Room::findOrFail($id);
        return response()->json($room);
    }
}