<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::query();

        if ($request->has('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        if ($request->has('gender') && $request->gender !== 'All') {
            $query->where('gender', $request->gender);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $rooms = $query->get();
        return response()->json($rooms);
    }
}