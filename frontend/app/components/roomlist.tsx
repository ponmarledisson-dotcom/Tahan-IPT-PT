"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── TYPES ───────────────────────────────────────────────────────────────────
type Room = {
  id: number;
  name: string;
  type: "Private" | "Bedspacer";
  gender: "Male" | "Female" | "Mixed";
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

const BACKEND_URL = "http://127.0.0.1:8000";

const GENDER_BADGE = {
  Male: { label: "Boys Only", bg: "#dbeafe", color: "#1e40af" },
  Female: { label: "Girls Only", bg: "#fce7f3", color: "#9d174d" },
  Mixed: { label: "Mixed", bg: "#f3f4f6", color: "#374151" },
};

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function RoomCard({ room, onSelect, disabled = false }: { room: Room; onSelect: (r: Room) => void; disabled?: boolean }) {
  const badge = GENDER_BADGE[room.gender] ?? GENDER_BADGE["Mixed"];
  return (
    <div className="bg-[#fffaf4] rounded-xl shadow-md overflow-hidden" style={{ opacity: disabled ? 0.5 : 1, filter: disabled ? "grayscale(100%)" : "none", pointerEvents: disabled ? "none" : "auto" }}>
      <div className="relative w-full h-48">
        <Image src={room.image ? `${BACKEND_URL}/storage/${room.image}` : "/room1.jpg"} alt={room.name} fill className="object-cover" unoptimized />
        <span className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm" style={{ backgroundColor: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-[#3b2314]">{room.name}</h3>
          <span className={`text-white text-xs px-3 py-1 rounded-full ${room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"}`}>{room.type}</span>
        </div>
        <p className="text-xl font-bold text-[#3b2314] mb-1">₱{room.price.toLocaleString()}/month</p>
        <p className={`text-sm font-bold mb-4 ${room.available ? "text-green-600" : "text-red-500"}`}>{room.available ? "✅ Available" : "🔴 Fully Occupied"}</p>
        <button onClick={() => onSelect(room)} disabled={!room.available} className={`w-full py-2 rounded-lg font-semibold text-white ${!room.available ? "bg-[#c4b5a5]" : "bg-[#5c3d2e] hover:bg-[#7a5240]"}`}>
          {room.available ? "View Room" : "Fully Occupied"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoomListings() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [typeFilter, setTypeFilter] = useState<"All" | "Private" | "Bedspacer">("All");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/rooms`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rooms.filter((r) => typeFilter === "All" || r.type === typeFilter);
  const availableRooms = filtered.filter((r) => r.available);
  const unavailableRooms = filtered.filter((r) => !r.available);

  if (loading) return <section className="px-8 py-10"><p className="text-center text-[#9c8878] animate-pulse py-20">Loading rooms...</p></section>;

  return (
    <section className="px-8 py-10">
      {/* Updated Header - Matches Photo 1 layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#3b2314]">Our Rooms</h2>
          <p className="text-[#9c8878] text-sm mt-1">
            {availableRooms.length} available · {unavailableRooms.length} fully occupied
          </p>
        </div>

        {/* Type Filter only */}
        <div className="flex gap-2 bg-[#f5ede0] p-1 rounded-xl w-fit">
          {(["All", "Private", "Bedspacer"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                typeFilter === type ? "bg-[#5c3d2e] text-white shadow" : "text-[#9c8878] hover:text-[#5c3d2e]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Available Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRooms.map((room) => (
          <RoomCard key={room.id} room={room} onSelect={setSelectedRoom} />
        ))}
      </div>
      
      {/* (Modal component would go here as before) */}
    </section>
  );
}