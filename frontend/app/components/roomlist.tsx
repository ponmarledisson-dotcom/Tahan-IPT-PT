"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── TYPES ───────────────────────────────────────────────────────────────────
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

const BACKEND_URL = "http://127.0.0.1:8000";

const GENDER_BADGE = {
  "Male Only": { label: "Boys Only", bg: "#dbeafe", color: "#1e40af" },
  "Female Only": { label: "Girls Only", bg: "#fce7f3", color: "#9d174d" },
  Mixed: { label: "Mixed", bg: "#f3f4f6", color: "#374151" },
};

// ── ROOM CARD ────────────────────────────────────────────────────────────────
function RoomCard({
  room,
  onSelect,
  disabled = false,
}: {
  room: Room;
  onSelect: (r: Room) => void;
  disabled?: boolean;
}) {
  const badge = GENDER_BADGE[room.gender_type] ?? GENDER_BADGE["Mixed"];

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#e8ddd0]"
      style={{
        opacity: disabled ? 0.6 : 1,
        filter: disabled ? "grayscale(100%)" : "none",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div className="relative w-full h-48">
        <Image
          src={room.image ?? "/room1.jpg"}
          alt={room.name}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Gender badge */}
        <span
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        {/* FULL overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-black text-2xl border-4 border-white px-4 py-1 rotate-[-20deg] opacity-90">
              FULL
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-[#3b2314]">{room.name}</h3>
          <span
            className={`text-white text-xs px-3 py-1 rounded-full ${
              room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"
            }`}
          >
            {room.type}
          </span>
        </div>
        <p className="text-sm text-[#9c8878] mb-1">
          👥 {room.occupied}/{room.capacity} beds
        </p>
        <p className="text-sm text-yellow-500 mb-1">⭐ {room.rating} / 5</p>
        <p
          className={`text-sm font-bold mb-4 ${
            room.available ? "text-green-600" : "text-red-500"
          }`}
        >
          {room.available ? "✅ Available" : "🔴 Fully Occupied"}
        </p>
        <button
          onClick={() => onSelect(room)}
          disabled={!room.available}
          className={`w-full py-2 rounded-lg font-semibold text-white transition ${
            !room.available
              ? "bg-[#c4b5a5] cursor-not-allowed"
              : "bg-[#5c3d2e] hover:bg-[#7a5240]"
          }`}
        >
          {room.available ? "View Room" : "Fully Occupied"}
        </button>
      </div>
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────────────────────
function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const badge = GENDER_BADGE[room.gender_type] ?? GENDER_BADGE["Mixed"];

  const detailUrl = `/rooms/${room.id}?name=${encodeURIComponent(room.name)}&type=${encodeURIComponent(room.type)}&price=${room.price}&rating=${room.rating}&available=${room.available}&occupied=${room.occupied}&capacity=${room.capacity}&description=${encodeURIComponent(room.description ?? "")}&image=${encodeURIComponent(room.image ?? "/room1.jpg")}`;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Room image */}
        <div className="relative w-full h-48">
          <Image
            src={room.image ?? "/room1.jpg"}
            alt={room.name}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Gender badge */}
          <span
            className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 left-2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Room info */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-black text-[#3b2314]">{room.name}</h3>
            <span
              className={`text-white text-xs px-3 py-1 rounded-full ${
                room.type === "Private" ? "bg-[#5c3d2e]" : "bg-[#9c8878]"
              }`}
            >
              {room.type}
            </span>
          </div>

          <p className="text-2xl font-bold text-[#3b2314] mb-3">
            ₱{Number(room.price).toLocaleString()}/month
          </p>

          <div className="flex flex-col gap-1 text-sm text-[#9c8878] mb-4">
            <p>
              👥 Occupancy: {room.occupied}/{room.capacity} beds
            </p>
            <p>⭐ Rating: {room.rating} / 5</p>
            <p
              className={
                room.available
                  ? "text-green-600 font-bold"
                  : "text-red-500 font-bold"
              }
            >
              {room.available ? "✅ Available" : "🔴 Fully Occupied"}
            </p>
          </div>
          <a
            href={detailUrl}
            className="block w-full py-3 bg-[#5c3d2e] text-white rounded-xl font-bold hover:bg-[#7a5240] transition text-center"
          >
            See Full Details
          </a>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoomListings() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [typeFilter, setTypeFilter] = useState<"All" | "Private" | "Bedspacer">(
    "All",
  );

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/rooms`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(
    (r) => typeFilter === "All" || r.type === typeFilter,
  );
  const availableRooms = filtered.filter((r) => r.available);
  const unavailableRooms = filtered.filter((r) => !r.available);

  if (loading)
    return (
      <section className="px-8 py-10">
        <p className="text-center text-[#9c8878] animate-pulse py-20">
          Loading rooms...
        </p>
      </section>
    );

  return (
    <section className="px-8 py-10 bg-[#E1DBC9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#3b2314]">Our Rooms</h2>
          <p className="text-[#6B7B84] text-sm mt-1">
            {availableRooms.length} available · {unavailableRooms.length} fully
            occupied
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 bg-white/50 p-1 rounded-xl w-fit border border-[#c8bfad]">
          {(["All", "Private", "Bedspacer"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                typeFilter === type
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
      {availableRooms.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-[#3b2314] mb-4">
            Available Rooms
            <span className="ml-2 text-sm font-normal text-[#6B7B84]">
              ({availableRooms.length})
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} onSelect={setSelectedRoom} />
            ))}
          </div>
        </>
      )}

      {/* Fully Occupied Rooms */}
      {unavailableRooms.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-[#9c8878] mb-2">
            Fully Occupied
            <span className="ml-2 text-sm font-normal">
              ({unavailableRooms.length})
            </span>
          </h3>
          <p className="text-sm text-[#9c8878] mb-4">
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

      {/* Modal */}
      {selectedRoom && (
        <RoomModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </section>
  );
}
