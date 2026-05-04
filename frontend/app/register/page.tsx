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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    birthdate: "",
    age: "",
    contact: "",
    address: "",
    email: "",
    emergencyName: "",
    emergencyContact: "",
    password: "",
    confirmPassword: "",
  });

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "birthdate") {
      const today = new Date();
      const birth = new Date(value);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setForm((prev) => ({ ...prev, birthdate: value, age: age.toString() }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.sex) e.sex = "Please select your sex.";
    if (!form.birthdate) e.birthdate = "Birthdate is required.";
    if (!form.contact.trim()) e.contact = "Contact number is required.";
    if (!form.email.includes("@")) e.email = "Enter a valid email address.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.emergencyName.trim())
      e.emergencyName = "Emergency contact name is required.";
    if (!form.emergencyContact.trim())
      e.emergencyContact = "Emergency contact number is required.";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    if (!agreed) e.agreed = "You must agree to the contract.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

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
      // Step 1 — Save tenant application record
      const tenantRes = await fetch("http://localhost:8000/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          sex: form.sex,
          birthdate: form.birthdate,
          age: parseInt(form.age),
          contact: form.contact,
          email: form.email,
          address: form.address,
          emergency_name: form.emergencyName,
          emergency_contact: form.emergencyContact,
          room_id: roomId,
        }),
      });

      const tenantData = await tenantRes.json();

      if (!tenantRes.ok) {
        // Map Laravel validation errors back to fields
        if (tenantData.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(tenantData.errors).forEach(([k, v]) => {
            mapped[k] = (v as string[])[0];
          });
          setErrors(mapped);
        } else {
          setErrors({
            general: tenantData.message ?? "Failed to submit application.",
          });
        }
        setLoading(false);
        return;
      }
<<<<<<< HEAD

      // Step 2 — Create login account
      const authRes = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          password: form.password,
          password_confirmation: form.confirmPassword,
          gender: form.sex,
          contact_number: form.contact,
          emergency_contact_name: form.emergencyName,
          emergency_contact_number: form.emergencyContact,
          agreed_to_terms: true,
        }),
      });

      const authData = await authRes.json();

      if (!authRes.ok) {
        if (authData.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(authData.errors).forEach(([k, v]) => {
            mapped[k] = (v as string[])[0];
          });
          setErrors(mapped);
        } else {
          setErrors({
            general: authData.message ?? "Account creation failed.",
          });
        }
        setLoading(false);
        return;
      }

      // Step 3 — Save token so they're instantly logged in after confirmation
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      // Step 4 — Redirect to confirmation page
      const query = new URLSearchParams({
        firstName: form.firstName,
        lastName: form.lastName,
        roomName,
        roomType,
        roomPrice,
      }).toString();

      window.location.href = `/confirmation?${query}`;
    } catch {
      setErrors({ general: "Cannot connect to server. Is Laravel running?" });
    } finally {
      setLoading(false);
=======
    } catch (error) {
      alert("Error: " + JSON.stringify(error));
      console.log(error);
>>>>>>> 3186b139165e6bb0b352f70ad6159a45e6e521cc
    }
  };

  // ── Reusable field component ──────────────────────────────────────────────
  const Field = ({
    label,
    name,
    type = "text",
    placeholder,
    fullWidth = false,
  }: {
    label: string;
    name: keyof typeof form;
    type?: string;
    placeholder?: string;
    fullWidth?: boolean;
  }) => (
    <div className={`flex flex-col gap-1 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-sm font-semibold text-[#5c3d2e]">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`px-4 py-2 rounded-xl border bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition
          ${errors[name] ? "border-red-400 bg-red-50" : "border-[#e8ddd0]"}`}
      />
      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

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
            Fill out all required information to apply
          </p>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {errors.general}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-2">
          {["Room Selected", "Contract", "Your Details", "Confirm"].map(
            (step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < 3
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
                    className={`flex-1 h-1 mx-2 mb-4 rounded ${i < 2 ? "bg-[#5c3d2e]" : "bg-[#e8ddd0]"}`}
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
            {[
              { label: "Room", value: roomName },
              { label: "Type", value: roomType },
              {
                label: "Monthly Rate",
                value: `₱${parseInt(roomPrice).toLocaleString()}`,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between text-[#5c3d2e]"
              >
                <span>{row.label}</span>
                <span className="font-bold text-[#3b2314]">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-[#5c3d2e] border-t border-[#e8ddd0] pt-2">
              <span>Downpayment (50%)</span>
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
              to the following:
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
          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setErrors((prev) => ({ ...prev, agreed: "" }));
              }}
              className="w-4 h-4 mt-0.5 accent-[#5c3d2e]"
            />
            <span className="text-sm text-[#5c3d2e]">
              I have read and agree to the terms and conditions
            </span>
          </label>
          {errors.agreed && (
            <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm border border-[#e8ddd0]">
          <h2 className="text-lg font-bold text-[#3b2314] mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" name="firstName" placeholder="Juan" />
            <Field label="Last Name" name="lastName" placeholder="Dela Cruz" />

            {/* Sex dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Sex
              </label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className={`px-4 py-2 rounded-xl border bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition
                  ${errors.sex ? "border-red-400 bg-red-50" : "border-[#e8ddd0]"}`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.sex && (
                <p className="text-xs text-red-500">{errors.sex}</p>
              )}
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
                className={`px-4 py-2 rounded-xl border bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition
                  ${errors.birthdate ? "border-red-400 bg-red-50" : "border-[#e8ddd0]"}`}
              />
              {errors.birthdate && (
                <p className="text-xs text-red-500">{errors.birthdate}</p>
              )}
            </div>

            {/* Age - read only */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Age (auto-calculated)
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                readOnly
                placeholder="Auto-filled from birthdate"
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-[#f5ede0] text-[#9c8878] cursor-not-allowed"
              />
            </div>

            <Field
              label="Contact / Mobile Number"
              name="contact"
              placeholder="09XXXXXXXXX"
              type="tel"
            />
            <Field
              label="Email"
              name="email"
              placeholder="juan@email.com"
              type="email"
            />
            <Field
              label="Emergency Contact Name"
              name="emergencyName"
              placeholder="Maria Dela Cruz"
            />
            <Field
              label="Emergency Contact Number"
              name="emergencyContact"
              placeholder="09XXXXXXXXX"
              type="tel"
            />
            <Field
              label="Permanent Home Address"
              name="address"
              placeholder="123 Street, Barangay, City"
              fullWidth
            />
          </div>
        </div>

        {/* Account Password */}
        <div className="bg-[#fffaf4] rounded-2xl p-6 shadow-sm border border-[#e8ddd0]">
          <h2 className="text-lg font-bold text-[#3b2314] mb-1">
            Create Your Account
          </h2>
          <p className="text-sm text-[#9c8878] mb-4">
            Set a password so you can log in and track your application.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
            />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition ${
            loading
              ? "bg-[#c4a898] cursor-not-allowed"
              : "bg-[#5c3d2e] hover:bg-[#7a5240] shadow-lg"
          }`}
        >
          {loading ? "Submitting…" : "Submit Application"}
        </button>

        <p className="text-center text-sm text-[#9c8878]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#5c3d2e] font-bold hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </main>
  );
}
