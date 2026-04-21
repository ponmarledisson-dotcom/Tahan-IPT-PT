"use client";
import Image from "next/image";
import { useState } from "react";

const rooms = [
  {
    id: 1,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 2,
    name: "Room 102",
    type: "Bedspacer",
    price: 1500,
    rating: 4.2,
    available: false,
    capacity: 5,
    occupied: 5,
    image: "/room1.jpg",
    amenities: ["WiFi included", "Shared bathroom", "Locker provided"],
    rules: ["No smoking inside", "No overnight visitors", "Curfew at 10PM"],
    description: "Affordable bedspace ideal for students on a budget.",
  },
  {
    id: 3,
    name: "Room 103",
    type: "Private",
    price: 4000,
    rating: 4.8,
    available: true,
    capacity: 5,
    occupied: 1,
    image: "/room1.jpg",
    amenities: [
      "WiFi included",
      "Air conditioning",
      "Private bathroom",
      "Ref and microwave",
    ],
    rules: ["No smoking inside", "No overnight visitors", "Curfew at 10PM"],
    description: "A spacious private room with complete amenities.",
  },
  {
    id: 4,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 5,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 6,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 7,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 8,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 9,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 10,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 11,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 12,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 13,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 14,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
  {
    id: 15,
    name: "Room 101",
    type: "Private",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
  },
];

export default function RoomListings() {
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(
    null,
  );

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
                  className={`text-white text-xs px-3 py-1 rounded-full ${room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#f5f0e8]0"}`}
                >
                  {room.type}
                </span>
              </div>
              <p className="text-xl font-bold text-[#3b2314] mb-1">
                ₱{room.price.toLocaleString()}/month
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Occupancy {room.occupied}/{room.capacity}
              </p>
              <p className="text-sm text-[#9c8878] mb-1">
                ⭐ {room.rating} rating
              </p>
              <p
                className={`text-sm font-bold mb-4 ${room.available ? "text-green-500" : "text-orange-400"}`}
              >
                {room.available ? "Available" : "Full"}
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

      {/* Modal Popup */}
      {/* Quick Preview Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-[#fffaf4] rounded-2xl w-11/12 max-w-md relative shadow-xl">
            {/* X Button */}
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute -top-3 -right-3 text-xl font-bold text-white bg-[#5c3d2e] hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition z-10 shadow-md"
            >
              ✕
            </button>

            {/* Room Image */}
            <Image
              src={selectedRoom.image}
              alt={selectedRoom.name}
              width={600}
              height={300}
              className="w-full h-48 object-cover rounded-t-2xl"
            />

            {/* Major Details */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-[#3b2314]">
                  {selectedRoom.name}
                </h2>
                <span
                  className={`text-white text-xs px-3 py-1 rounded-full ${selectedRoom.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#f5f0e8]0"}`}
                >
                  {selectedRoom.type}
                </span>
              </div>

              <p className="text-2xl font-bold text-[#3b2314] mb-2">
                ₱{selectedRoom.price.toLocaleString()}/month
              </p>

              <p className="text-sm text-gray-500 mb-2">
                Occupancy: {selectedRoom.occupied}/{selectedRoom.capacity}{" "}
                persons
              </p>

              <p className="text-sm text-[#9c8878] mb-2">
                ⭐ {selectedRoom.rating} / 5
              </p>

              <p
                className={`text-sm font-bold mb-6 ${selectedRoom.available ? "text-green-500" : "text-orange-400"}`}
              >
                {selectedRoom.available ? "✅ Available" : "🕐 Available Soon"}
              </p>

              {/* See Full Details Button */}
              <a
                href={`/rooms/${selectedRoom.id}?name=${selectedRoom.name}&type=${selectedRoom.type}&price=${selectedRoom.price}&rating=${selectedRoom.rating}&available=${selectedRoom.available}&occupied=${selectedRoom.occupied}&capacity=${selectedRoom.capacity}&description=${selectedRoom.description}&image=${selectedRoom.image}`}
              >
                <button className="w-full py-3 bg-[#5c3d2e] text-white rounded-xl text-base font-bold hover:bg-[#7a5240] transition">
                  See Full Details →
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
