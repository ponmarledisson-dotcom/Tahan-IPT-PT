"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type Room = {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  available: boolean;
  capacity: number;
  occupied: number;
  image: string;
  description: string;
  amenities: string[];
  rules: string[];
};

export default function RoomListings() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  const buildRoomUrl = (room: Room) => {
    const params = new URLSearchParams({
      name: room.name,
      type: room.type,
      price: String(room.price),
      rating: String(room.rating),
      available: String(room.available),
      occupied: String(room.occupied),
      capacity: String(room.capacity),
      description: room.description,
      image: room.image,
    });
    return `/rooms/${room.id}?${params.toString()}`;
  };

  return (
    <section className="px-8 py-10">
      <h2 className="text-3xl font-bold text-[#3b2314] mb-6">
        Available Rooms
      </h2>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-[#fffaf4] rounded-xl shadow-md overflow-hidden"
          >
            <Image
              src={room.image}
              alt={room.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-[#3b2314]">
                  {room.name}
                </h3>
                <span
                  className={`text-white text-xs px-3 py-1 rounded-full ${room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"}`}
                >
                  {room.type}
                </span>
              </div>
              <p className="text-xl font-bold text-[#3b2314] mb-1">
                P{Number(room.price).toLocaleString()}/month
              </p>
              <p className="text-sm text-[#9c8878] mb-1">
                {room.rating} rating
              </p>
              <p className="text-sm text-[#9c8878] mb-1">
                Occupancy: {room.occupied}/{room.capacity} persons
              </p>
              <p
                className={`text-sm font-bold mb-4 ${room.available ? "text-green-500" : "text-orange-400"}`}
              >
                {room.available ? "Available" : "Available Soon"}
              </p>
              <button
                onClick={() => setSelectedRoom(room)}
                className="w-full py-2 bg-[#5c3d2e] text-white rounded-lg hover:bg-[#7a5240] transition"
              >
                View Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Preview Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-[#fffaf4] rounded-2xl w-11/12 max-w-md relative shadow-xl">
            {/* X Button */}
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute -top-3 -right-3 text-xl font-bold text-white bg-[#5c3d2e] hover:bg-[#7a5240] rounded-full w-8 h-8 flex items-center justify-center transition z-10 shadow-md"
            >
              X
            </button>

            {/* Room Image */}
            <Image
              src={selectedRoom.image}
              alt={selectedRoom.name}
              width={600}
              height={300}
              className="w-full h-48 object-cover rounded-t-2xl"
            />

            {/* Room Details */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-[#3b2314]">
                  {selectedRoom.name}
                </h2>
                <span
                  className={`text-white text-xs px-3 py-1 rounded-full ${selectedRoom.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"}`}
                >
                  {selectedRoom.type}
                </span>
              </div>

              <p className="text-2xl font-bold text-[#3b2314] mb-2">
                P{Number(selectedRoom.price).toLocaleString()}/month
              </p>
              <p className="text-sm text-[#9c8878] mb-2">
                {selectedRoom.rating} / 5
              </p>
              <p className="text-sm text-[#9c8878] mb-2">
                Occupancy: {selectedRoom.occupied}/{selectedRoom.capacity}{" "}
                persons
              </p>
              <p
                className={`text-sm font-bold mb-6 ${selectedRoom.available ? "text-green-500" : "text-orange-400"}`}
              >
                {selectedRoom.available ? "Available" : "Available Soon"}
              </p>

              <a
                href={buildRoomUrl(selectedRoom)}
                className="block w-full py-3 bg-[#5c3d2e] text-white rounded-xl text-base font-bold hover:bg-[#7a5240] transition text-center"
              >
                See Full Details
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
