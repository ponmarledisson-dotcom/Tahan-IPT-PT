"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Profile = {
  id: number;
  name: string;
  email: string;
  gender: string;
  contact_number: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  role: string;
  status: string;
  profile_photo: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Partial<Profile>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const token = () => localStorage.getItem("token") ?? "";

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:8000/api/me", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name,
          email: data.email,
          gender: data.gender,
          contact_number: data.contact_number,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_number: data.emergency_contact_number,
        });
        setLoading(false);
      })
      .catch(() => {
        localStorage.clear();
        router.push("/login");
      });
  }, [router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Name is required.";
    if (!form.email?.includes("@")) e.email = "Enter a valid email.";
    if (!form.contact_number?.trim()) e.contact_number = "Contact number is required.";
    if (!form.emergency_contact_name?.trim()) e.emergency_contact_name = "Emergency contact name is required.";
    if (!form.emergency_contact_number?.trim()) e.emergency_contact_number = "Emergency contact number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name ?? "");
      formData.append("email", form.email ?? "");
      formData.append("gender", form.gender ?? "");
      formData.append("contact_number", form.contact_number ?? "");
      formData.append("emergency_contact_name", form.emergency_contact_name ?? "");
      formData.append("emergency_contact_number", form.emergency_contact_number ?? "");
      if (photoFile) formData.append("profile_photo", photoFile);

      const res = await fetch("http://localhost:8000/api/profile/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            mapped[k] = (v as string[])[0];
          });
          setErrors(mapped);
        }
        return;
      }

      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...u, name: form.name }));
      }

      setProfile((prev) =>
        prev ? { ...prev, ...form, profile_photo: data.user.profile_photo } : prev
      );
      setPhotoFile(null);
      setPhotoPreview(null);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getPhotoUrl = () => {
    if (photoPreview) return photoPreview;
    if (profile?.profile_photo)
      return `http://localhost:8000/uploads/${profile.profile_photo}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
        <p className="text-[#9c8878] animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (!profile) return null;

  const Row = ({
    label,
    fieldKey,
    type = "text",
  }: {
    label: string;
    fieldKey: keyof Profile;
    type?: string;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0e6d6] last:border-0 gap-1 sm:gap-0">
      <span className="text-sm font-semibold text-[#9c8878] sm:w-52 shrink-0">
        {label}
      </span>
      {editing ? (
        <div className="flex-1 flex flex-col gap-1">
          {fieldKey === "gender" ? (
            <select
              name="gender"
              value={form.gender ?? ""}
              onChange={handleChange}
              className={`w-full sm:max-w-sm px-3 py-2 rounded-xl border text-[#3b2314] bg-[#fff8f0] text-sm outline-none focus:ring-2 focus:ring-[#5c3d2e]/40
                ${errors.gender ? "border-red-400" : "border-[#d6c4b0]"}`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Prefer not to say</option>
            </select>
          ) : (
            <input
              type={type}
              name={fieldKey}
              value={(form[fieldKey] as string) ?? ""}
              onChange={handleChange}
              className={`w-full sm:max-w-sm px-3 py-2 rounded-xl border text-[#3b2314] bg-[#fff8f0] text-sm outline-none focus:ring-2 focus:ring-[#5c3d2e]/40
                ${errors[fieldKey] ? "border-red-400" : "border-[#d6c4b0]"}`}
            />
          )}
          {errors[fieldKey] && (
            <p className="text-xs text-red-500">{errors[fieldKey]}</p>
          )}
        </div>
      ) : (
        <span className="text-sm text-[#3b2314] font-medium sm:flex-1">
          {(profile[fieldKey] as string) || (
            <span className="text-[#c4b5a5]">Not set</span>
          )}
        </span>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fdf6ec] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-[#9c8878] hover:text-[#5c3d2e] transition mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#3b2314]">My Profile</h1>
            <p className="text-sm text-[#9c8878] mt-1">
              Manage your personal information
            </p>
          </div>

          {/* Avatar with upload on hover */}
          <div className="relative group w-16 h-16">
            {getPhotoUrl() ? (
              <img
                src={getPhotoUrl()!}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#d6c4b0]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center text-2xl font-black">
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}
            {editing && (
              <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-bold text-center leading-tight">
                  Change
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            ✅ Profile updated successfully!
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#ede0d0] shadow-sm overflow-hidden">
          <div className="bg-[#fffaf4] px-6 py-3 border-b border-[#ede0d0] flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                profile.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {profile.status === "active" ? "✅ Active" : "🔴 Inactive"}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f0e6d6] text-[#5c3d2e] capitalize">
              {profile.role}
            </span>
          </div>

          <div className="px-6 py-2">
            <Row label="Full Name" fieldKey="name" />
            <Row label="Email Address" fieldKey="email" type="email" />
            <Row label="Gender" fieldKey="gender" />
            <Row label="Contact Number" fieldKey="contact_number" type="tel" />
            <Row label="Emergency Contact Name" fieldKey="emergency_contact_name" />
            <Row
              label="Emergency Contact Number"
              fieldKey="emergency_contact_number"
              type="tel"
            />
          </div>

          <div className="px-6 py-4 border-t border-[#ede0d0] bg-[#fffaf4] flex gap-3 justify-end">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                  className="px-5 py-2 border border-[#d6c4b0] text-[#5c3d2e] font-semibold rounded-xl hover:bg-[#f5ede0] transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}