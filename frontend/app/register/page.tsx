"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#5c3d2e]">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const params = useSearchParams();
  const roomName = params.get("name") || "Room";
  const roomType = params.get("type") || "Private";
  const roomPrice = params.get("price") || "0";
  const roomId = params.get("id") || "1";

  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    birthdate: "",
    age: "",
    contact: "",
    address: "",
    email: "",
    emergencyContact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "birthdate") {
      const today = new Date();
      const birth = new Date(value);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
          ? age - 1
          : age;
      setForm({ ...form, birthdate: value, age: actualAge.toString() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleSubmit = async () => {
    if (!agreed) {
      alert("Please agree to the contract first!");
      return;
    }

    console.log("Sending data:", {
      first_name: form.firstName,
      last_name: form.lastName,
      sex: form.sex,
      birthdate: form.birthdate,
      age: parseInt(form.age),
      contact: form.contact,
      email: form.email,
      address: form.address,
      emergency_name: "",
      emergency_contact: form.emergencyContact,
      room_id: roomId,
    });

    try {
      const response = await fetch("http://localhost:8000/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          sex: form.sex,
          birthdate: form.birthdate,
          age: parseInt(form.age),
          contact: form.contact,
          email: form.email,
          address: form.address,
          emergency_contact: form.emergencyContact,
          room_id: roomId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const query = new URLSearchParams({
          ...form,
          roomName,
          roomType,
          roomPrice,
        }).toString();
        window.location.href = `/confirmation?${query}`;
      } else {
        alert("Error: " + JSON.stringify(data.errors));
      }
    } catch (error) {
      alert("Error: " + JSON.stringify(error));
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <Link
            href={`/rooms/${roomId}?name=${roomName}&type=${roomType}&price=${roomPrice}`}
            className="text-[#5c3d2e] text-sm hover:underline"
          >
            ← Back to Room Details
          </Link>
          <h1 className="text-3xl font-bold text-[#3b2314] mt-2">
            Room Application
          </h1>
          <p className="text-[#9c8878] mt-1">
            Please fill out all required information
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-2">
          {["Room Selected", "Contract", "Your Details", "Confirm"].map(
            (step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0
                        ? "bg-[#5c3d2e] text-white"
                        : i === 1
                          ? "bg-[#5c3d2e] text-white"
                          : i === 2
                            ? "bg-[#5c3d2e] text-white"
                            : "bg-[#e8ddd0] text-[#9c8878]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-[#9c8878] mt-1 text-center">
                    {step}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 mb-4 rounded ${
                      i < 2 ? "bg-[#5c3d2e]" : "bg-[#e8ddd0]"
                    }`}
                  />
                )}
              </div>
            ),
          )}
        </div>

        {/* Room Summary */}
        <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm border border-[#e8ddd0]">
          <h2 className="text-lg font-bold text-[#3b2314] mb-3">
            Selected Room
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-[#5c3d2e]">
              <span>Room</span>
              <span className="font-bold text-[#3b2314]">{roomName}</span>
            </div>
            <div className="flex justify-between text-[#5c3d2e]">
              <span>Type</span>
              <span className="font-bold text-[#3b2314]">{roomType}</span>
            </div>
            <div className="flex justify-between text-[#5c3d2e]">
              <span>Monthly Rate</span>
              <span className="font-bold text-[#3b2314]">
                ₱{parseInt(roomPrice).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#5c3d2e] border-t border-[#e8ddd0] pt-2">
              <span>Downpayment</span>
              <span className="font-bold text-[#3b2314]">
                ₱{(parseInt(roomPrice) / 2).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Contract */}
        <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm border border-[#e8ddd0]">
          <h2 className="text-lg font-bold text-[#3b2314] mb-3">
            Boarding House Contract
          </h2>
          <div className="h-48 overflow-y-auto bg-white rounded-xl p-4 text-sm text-[#5c3d2e] leading-relaxed border border-[#e8ddd0]">
            <p className="font-bold mb-2">TERMS AND CONDITIONS</p>
            <p className="mb-2">
              By applying for a room in this boarding house, the tenant agrees
              to the following terms and conditions:
            </p>
            <p className="mb-2">
              1. <strong>Rental Payment</strong> — Rent is due on the 1st of
              every month. A penalty of ₱100/day will be charged for late
              payments.
            </p>
            <p className="mb-2">
              2. <strong>House Rules</strong> — Tenants must follow all house
              rules including curfew, no overnight visitors, and no smoking
              inside the premises.
            </p>
            <p className="mb-2">
              3. <strong>Downpayment</strong> — A downpayment equivalent to 50%
              of the monthly rent is required upon move-in.
            </p>
            <p className="mb-2">
              4. <strong>Notice Period</strong> — Tenants must give a 30-day
              notice before moving out.
            </p>
            <p className="mb-2">
              5. <strong>Damages</strong> — Any damages to the room or
              facilities will be charged to the tenant.
            </p>
            <p className="mb-2">
              6. <strong>Visitors</strong> — Visitors are allowed only until
              9PM. Overnight visitors are strictly prohibited.
            </p>
            <p className="mb-2">
              7. <strong>Cleanliness</strong> — Tenants are responsible for
              keeping their rooms and common areas clean.
            </p>
            <p className="mb-2">
              8. <strong>Termination</strong> — The landlord reserves the right
              to terminate the tenancy for violation of house rules.
            </p>
            <p>
              9. <strong>Privacy</strong> — Personal information collected will
              only be used for boarding house management purposes.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-[#5c3d2e]"
            />
            <span className="text-sm text-[#5c3d2e]">
              I have read and agree to the terms and conditions
            </span>
          </label>
        </div>

        {/* Registration Form */}
        <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm border border-[#e8ddd0]">
          <h2 className="text-lg font-bold text-[#3b2314] mb-4">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                First Name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Juan"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Last Name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Dela Cruz"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Sex */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Sex
              </label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Birthdate */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Birthdate
              </label>
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="20"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Contact/Mobile Number
              </label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="juan@email.com"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Emergency Contact Number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Emergency Contact Number
              </label>
              <input
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>

            {/* Address - Full Width */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Permanent Home Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Street, Barangay, City, Province"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!agreed}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition flex items-center justify-center gap-2 ${
            agreed
              ? "bg-[#5c3d2e] hover:bg-[#7a5240] shadow-lg"
              : "bg-[#c4a898] cursor-not-allowed"
          }`}
        >
          {agreed ? (
            <>Submit Application</>
          ) : (
            <>Please agree to the contract first</>
          )}
        </button>
      </div>
    </main>
  );
}
