"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  name: string;
  type: "Private" | "Bedspacer";
  gender_type: "Male Only" | "Female Only" | "Mixed";
  price: number;
  rating: number;
  available: boolean;
  capacity: number;
  occupied: number;
  image: string;
  description?: string;
  amenities?: string[];
  rules?: string[];
};

const rooms: Room[] = [
  {
    id: 1,
    name: "Room 101",
    type: "Private",
    gender_type: "Female Only",
    price: 3500,
    rating: 4.5,
    available: true,
    capacity: 1,
    occupied: 0,
    image: "/room1.jpg",
    description: "A cozy private room with air conditioning and natural light.",
    amenities: ["WiFi included", "Air conditioning", "Private bathroom"],
    rules: ["No smoking inside", "No overnight visitors", "Curfew at 10PM"],
  },
  {
    id: 2,
    name: "Room 102",
    type: "Bedspacer",
    gender_type: "Male Only",
    price: 1500,
    rating: 4.2,
    available: true,
    capacity: 5,
    occupied: 3,
    image: "/room1.jpg",
    description: "Affordable bedspace ideal for students on a budget.",
    amenities: ["WiFi included", "Shared bathroom", "Locker provided"],
    rules: ["No smoking inside", "No overnight visitors", "Curfew at 10PM"],
  },
  {
    id: 3,
    name: "Room 103",
    type: "Private",
    gender_type: "Mixed",
    price: 4000,
    rating: 4.8,
    available: true,
    capacity: 1,
    occupied: 0,
    image: "/room1.jpg",
    description: "A spacious private room with complete amenities.",
    amenities: [
      "WiFi included",
      "Air conditioning",
      "Private bathroom",
      "Ref and microwave",
    ],
    rules: ["No smoking inside", "No overnight visitors", "Curfew at 10PM"],
  },
  {
    id: 4,
    name: "Room 201",
    type: "Bedspacer",
    gender_type: "Female Only",
    price: 2000,
    rating: 4.0,
    available: true,
    capacity: 4,
    occupied: 2,
    image: "/room1.jpg",
    description: "Girls-only bedspace with a study area and secure lockers.",
    amenities: ["WiFi included", "Study desk", "Locker provided", "Fan"],
    rules: ["Curfew at 10PM", "No loud music after 9PM"],
  },
  {
    id: 5,
    name: "Room 202",
    type: "Bedspacer",
    gender_type: "Male Only",
    price: 1800,
    rating: 3.9,
    available: true,
    capacity: 6,
    occupied: 4,
    image: "/room1.jpg",
    description: "Budget-friendly male bedspace near the common area.",
    amenities: ["WiFi included", "Shared bathroom", "Fan"],
    rules: ["No smoking", "Curfew at 11PM"],
  },
  {
    id: 6,
    name: "Room 301",
    type: "Private",
    gender_type: "Mixed",
    price: 5000,
    rating: 4.9,
    available: true,
    capacity: 1,
    occupied: 0,
    image: "/room1.jpg",
    description:
      "Premium private room on the top floor with great ventilation.",
    amenities: [
      "WiFi included",
      "Air conditioning",
      "Private bathroom",
      "Ref",
      "TV",
    ],
    rules: ["No smoking", "No pets", "No overnight visitors"],
  },
  {
    id: 7,
    name: "Room 302",
    type: "Bedspacer",
    gender_type: "Female Only",
    price: 1600,
    rating: 4.1,
    available: false,
    capacity: 4,
    occupied: 4,
    image: "/room1.jpg",
    description: "Fully occupied girls bedspace on the third floor.",
    amenities: ["WiFi included", "Shared bathroom", "Locker provided"],
    rules: ["No smoking", "Curfew at 10PM"],
  },
  {
    id: 8,
    name: "Room 303",
    type: "Private",
    gender_type: "Male Only",
    price: 3800,
    rating: 4.3,
    available: false,
    capacity: 1,
    occupied: 1,
    image: "/room1.jpg",
    description: "Male private room currently occupied.",
    amenities: ["WiFi included", "Air conditioning", "Private bathroom"],
    rules: ["No smoking", "No overnight visitors"],
  },
  {
    id: 9,
    name: "Room 304",
    type: "Bedspacer",
    gender_type: "Mixed",
    price: 2200,
    rating: 4.0,
    available: false,
    capacity: 5,
    occupied: 5,
    image: "/room1.jpg",
    description: "Mixed bedspace on the third floor, currently full.",
    amenities: ["WiFi included", "Shared bathroom", "Fan", "Study desk"],
    rules: ["No smoking", "Curfew at 10PM", "No loud music"],
  },
];

const GENDER_BADGE = {
  "Male Only": { label: "Boys Only", bg: "#dbeafe", color: "#1e40af" },
  "Female Only": { label: "Girls Only", bg: "#fce7f3", color: "#9d174d" },
  Mixed: { label: "Mixed", bg: "#f3f4f6", color: "#374151" },
};

function RoomCard({
  room,
  onSelect,
  disabled = false,
}: {
  room: Room;
  onSelect: (r: Room) => void;
  disabled?: boolean;
}) {
  const badge = GENDER_BADGE[room.gender_type];
  return (
    <div
      className="bg-[#fffaf4] rounded-xl shadow-md overflow-hidden"
      style={{
        opacity: disabled ? 0.5 : 1,
        filter: disabled ? "grayscale(100%)" : "none",
        transition: "opacity 0.3s, filter 0.3s",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div className="relative w-full h-48">
        <Image src={room.image} alt={room.name} fill className="object-cover" />
        <span
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        {!room.available && (
          <>
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span
                className="text-white font-black text-3xl tracking-widest px-6 py-1 rounded"
                style={{
                  transform: "rotate(-30deg)",
                  border: "3px solid rgba(255,255,255,0.75)",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                FULL
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-[#3b2314]">{room.name}</h3>
          <span
            className={`text-white text-xs px-3 py-1 rounded-full ${room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"}`}
          >
            {room.type}
          </span>
        </div>
        <p className="text-xl font-bold text-[#3b2314] mb-1">
          ₱{room.price.toLocaleString()}/month
        </p>
        <p className="text-sm text-[#9c8878] mb-1">
          👥 Occupancy: {room.occupied}/{room.capacity} beds
        </p>
        <p className="text-sm text-[#9c8878] mb-1">⭐ {room.rating} rating</p>
        <p
          className={`text-sm font-bold mb-4 ${room.available ? "text-green-600" : "text-red-500"}`}
        >
          {room.available ? "✅ Available" : "🔴 Fully Occupied"}
        </p>
        <button
          onClick={() => onSelect(room)}
          disabled={!room.available}
          className={`w-full py-2 rounded-lg font-semibold transition text-white ${!room.available ? "bg-[#c4b5a5] cursor-not-allowed" : "bg-[#5c3d2e] hover:bg-[#7a5240] cursor-pointer"}`}
        >
          {room.available ? "View Room" : "Fully Occupied"}
        </button>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-[#d6c4b0]" />
      <span className="text-sm font-semibold text-[#9c8878] uppercase tracking-widest whitespace-nowrap">
        Fully Occupied / Unavailable
      </span>
      <div className="flex-1 h-px bg-[#d6c4b0]" />
    </div>
  );
}

function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const router = useRouter();
  const badge = GENDER_BADGE[room.gender_type];

  const handleSeeFullDetails = () => {
    const params = new URLSearchParams({
      name: room.name,
      type: room.type,
      gender_type: room.gender_type,
      price: String(room.price),
      rating: String(room.rating),
      available: String(room.available),
      occupied: String(room.occupied),
      capacity: String(room.capacity),
      description: room.description ?? "",
      image: room.image,
    });
    router.push(`/rooms/${room.id}?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-[#fffaf4] rounded-2xl w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 text-xl font-bold text-white bg-[#5c3d2e] hover:bg-[#7a5240] rounded-full w-8 h-8 flex items-center justify-center transition z-10 shadow-md"
        >
          ✕
        </button>
        <div className="relative w-full h-48">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover rounded-t-2xl"
          />
          <span
            className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-[#3b2314]">{room.name}</h2>
            <span
              className={`text-white text-xs px-3 py-1 rounded-full ${room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"}`}
            >
              {room.type}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#3b2314] mb-2">
            ₱{room.price.toLocaleString()}/month
          </p>
          <p className="text-sm text-[#9c8878] mb-2">
            👥 Occupancy: {room.occupied}/{room.capacity} beds
          </p>
          <p className="text-sm text-[#9c8878] mb-2">⭐ {room.rating} / 5</p>
          <p
            className={`text-sm font-bold mb-6 ${room.available ? "text-green-600" : "text-red-500"}`}
          >
            {room.available ? "✅ Available" : "🔴 Fully Occupied"}
          </p>
          <button
            onClick={handleSeeFullDetails}
            className="w-full py-3 bg-[#5c3d2e] text-white rounded-xl text-base font-bold hover:bg-[#7a5240] transition"
          >
            See Full Details →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoomListings() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState<"All" | "Private" | "Bedspacer">("All");

  const filteredRooms =
    filter === "All" ? rooms : rooms.filter((r) => r.type === filter);
  const availableRooms = filteredRooms.filter((r) => r.available);
  const unavailableRooms = filteredRooms.filter((r) => !r.available);

  return (
    <section className="px-8 py-10">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#3b2314]">Our Rooms</h2>
          <p className="text-[#9c8878] text-sm mt-1">
            {availableRooms.length} available · {unavailableRooms.length} fully
            occupied
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 bg-[#f5ede0] p-1 rounded-xl">
          {(["All", "Private", "Bedspacer"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === type
                  ? "bg-[#5c3d2e] text-white shadow"
                  : "text-[#9c8878] hover:text-[#5c3d2e]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Available Rooms */}
      {availableRooms.length > 0 ? (
        <>
          <h3 className="text-xl font-bold text-[#3b2314] mb-4">
            Available Rooms
            <span className="ml-2 text-base font-normal text-[#9c8878]">
              ({availableRooms.length})
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} onSelect={setSelectedRoom} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-[#9c8878]">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-lg font-semibold">
            No available rooms for this filter.
          </p>
          <p className="text-sm mt-1">Try selecting a different type.</p>
        </div>
      )}

      {/* Unavailable Rooms */}
      {unavailableRooms.length > 0 && (
        <>
          <SectionDivider />
          <h3 className="text-xl font-bold text-[#9c8878] mb-2">
            Fully Occupied
            <span className="ml-2 text-base font-normal">
              ({unavailableRooms.length})
            </span>
          </h3>
          <p className="text-sm text-[#b5a598] mb-6">
            These rooms are currently at full capacity. Check back later or
            contact the landlord to be waitlisted.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unavailableRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={setSelectedRoom}
                disabled
              />
            ))}
          </div>
        </>
      )}

      {selectedRoom && (
        <RoomModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </section>
  );
}
