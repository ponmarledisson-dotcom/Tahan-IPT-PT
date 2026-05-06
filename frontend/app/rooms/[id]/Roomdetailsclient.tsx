"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomDetailsClient({ roomId }: { roomId: string }) {
  const params = useSearchParams();
  const router = useRouter();

  const name = params.get("name") || "Room";
  const type = params.get("type") || "Private";
  const price = params.get("price") || "0";
  const rating = params.get("rating") || "0";
  const available = params.get("available") === "true";
  const occupied = params.get("occupied") || "0";
  const capacity = params.get("capacity") || "0";
  const description = params.get("description") || "";
  const image = params.get("image") || "/room1.jpg";

  const [user, setUser] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleGetRoom = () => {
    if (!user) {
      // Not logged in — go to register
      router.push(
        `/register?id=${roomId}&name=${name}&type=${type}&price=${price}`,
      );
    } else {
      // Logged in — show confirmation popup
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/apply-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: parseInt(roomId),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowConfirm(false);
        router.push("/dashboard");
      } else {
        setError(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Image */}
      <div className="relative w-full h-96">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <Link
          href="/"
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition"
        >
          Back to Listings
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="bg-[#5c3d2e] text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                {type}
              </span>
              <h1 className="text-5xl font-bold text-white mb-2">{name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-white/90 text-lg">
                  P{parseInt(price).toLocaleString()}/month
                </p>
                <span className="text-white/50">•</span>
                <p className="text-white/90 text-sm">{rating} / 5</p>
                <span className="text-white/50">•</span>
                <p
                  className={`text-sm font-bold ${available ? "text-green-400" : "text-orange-400"}`}
                >
                  {available ? "Available" : "Available Soon"}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
              <p className="text-white/70 text-xs mb-1">Occupancy</p>
              <p className="text-white text-2xl font-bold">
                {occupied}/{capacity}
              </p>
              <p className="text-white/70 text-xs">persons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Description */}
          <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3b2314] mb-3">
              Description
            </h2>
            <p className="text-[#5c3d2e] leading-relaxed">{description}</p>
          </div>

          {/* Amenities */}
          <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3b2314] mb-3">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                "WiFi included",
                "Air conditioning",
                "Private bathroom",
                "Cabinet and study table",
                "Electric fan",
                "Window with view",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[#5c3d2e]">
                  <span className="text-green-500">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3b2314] mb-3">
              House Rules
            </h2>
            <div className="flex flex-col gap-2">
              {[
                "No smoking inside",
                "No overnight visitors",
                "Curfew at 10PM",
                "Keep common areas clean",
                "No loud music after 9PM",
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-[#5c3d2e]">
                  <span className="text-red-400">✕</span>
                  {rule}
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3b2314] mb-3">Ratings</h2>
            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold text-[#3b2314]">
                {rating}
              </span>
              <div>
                <p className="text-yellow-400 text-2xl">★★★★★</p>
                <p className="text-[#9c8878] text-sm mt-1">
                  Based on 24 reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-[#3b2314] mb-4">
              Room Summary
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-[#5c3d2e]">
                <span>Room</span>
                <span className="font-bold text-[#3b2314]">{name}</span>
              </div>
              <div className="flex justify-between text-[#5c3d2e]">
                <span>Type</span>
                <span className="font-bold text-[#3b2314]">{type}</span>
              </div>
              <div className="flex justify-between text-[#5c3d2e]">
                <span>Occupancy</span>
                <span className="font-bold text-[#3b2314]">
                  {occupied}/{capacity} persons
                </span>
              </div>
              <div className="flex justify-between text-[#5c3d2e]">
                <span>Availability</span>
                <span
                  className={`font-bold ${available ? "text-green-500" : "text-orange-400"}`}
                >
                  {available ? "Available" : "Available Soon"}
                </span>
              </div>
              <div className="flex justify-between text-[#5c3d2e]">
                <span>Monthly Rate</span>
                <span className="font-bold text-[#3b2314]">
                  P{parseInt(price).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-[#e8ddd0] pt-3 flex justify-between text-[#3b2314] font-bold">
                <span>Downpayment (50%)</span>
                <span>P{(parseInt(price) / 2).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleGetRoom}
              className="block w-full mt-6 py-3 bg-[#5c3d2e] text-white rounded-xl font-bold hover:bg-[#7a5240] transition text-center"
            >
              GET ROOM
            </button>

            <p className="text-xs text-[#9c8878] text-center mt-3">
              {user
                ? `Applying as ${user.name}`
                : "You will be asked to register or log in after clicking GET ROOM"}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-black text-[#3b2314] mb-2">
              Confirm Room Application
            </h3>
            <p className="text-sm text-[#9c8878] mb-6">You are applying for:</p>

            <div className="bg-[#fdf6ec] rounded-xl p-4 mb-6 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9c8878]">Room</span>
                <span className="font-bold text-[#3b2314]">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9c8878]">Type</span>
                <span className="font-bold text-[#3b2314]">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9c8878]">Monthly Rate</span>
                <span className="font-bold text-[#3b2314]">
                  P{parseInt(price).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e8ddd0] pt-2">
                <span className="text-[#9c8878]">Applying as</span>
                <span className="font-bold text-[#3b2314]">{user?.name}</span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <p className="text-xs text-[#9c8878] text-center mb-4">
              Your application will be reviewed by the admin. You will be
              notified once approved.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setError("");
                }}
                className="flex-1 py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
