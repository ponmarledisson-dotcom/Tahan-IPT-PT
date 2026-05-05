"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  gender?: string;
  contact_number?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  profile_photo?: string;
};

type Application = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  room_id: number;
  room_name?: string;
  status: "pending" | "approved" | "rejected";
  move_in_date?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile">(
    "overview",
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    contact_number: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(stored);

    fetch("http://localhost:8000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          gender: data.gender ?? "",
          contact_number: data.contact_number ?? "",
          emergency_contact_name: data.emergency_contact_name ?? "",
          emergency_contact_number: data.emergency_contact_number ?? "",
        });
        setLoading(false);

        // Fetch application status using the tenant's email
        return fetch(`http://localhost:8000/api/tenants`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      })
      .then((res) => res?.json())
      .then((tenants) => {
        if (!tenants || !Array.isArray(tenants)) return;
        const userEmail = storedUser.email;
        const match = tenants.find((t: Application) => t.email === userEmail);
        if (match) setApplication(match);
        setLoadingApp(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("gender", form.gender);
    formData.append("contact_number", form.contact_number);
    formData.append("emergency_contact_name", form.emergency_contact_name);
    formData.append("emergency_contact_number", form.emergency_contact_number);
    formData.append("_method", "POST");
    if (photoFile) formData.append("profile_photo", photoFile);

    try {
      const res = await fetch("http://localhost:8000/api/profile/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEditing(false);
        setSaveSuccess(true);
        setPhotoFile(null);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      console.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const getPhotoUrl = () => {
    if (photoPreview) return photoPreview;
    if (user?.profile_photo)
      return `http://localhost:8000/storage/${user.profile_photo}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
        <p className="text-[#9c8878] animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  const photoUrl = getPhotoUrl();

  const ApplicationStatusCard = () => {
    if (loadingApp) {
      return (
        <div className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm mb-6 animate-pulse">
          <div className="h-4 bg-[#f5ede0] rounded w-1/3 mb-2" />
          <div className="h-3 bg-[#f5ede0] rounded w-2/3" />
        </div>
      );
    }

    if (!application) {
      return (
        <div className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🏠</span>
            <div>
              <p className="font-bold text-[#3b2314]">No Application Found</p>
              <p className="text-sm text-[#9c8878] mt-1">
                You haven't submitted a room application yet.{" "}
                <a href="/" className="text-[#5c3d2e] font-bold underline">
                  Browse rooms →
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    const roomLabel = application.room_name ?? `Room ${application.room_id}`;

    if (application.status === "pending") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⏳</span>
            <div>
              <p className="font-bold text-yellow-800 text-lg">
                Application Under Review
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Your application for{" "}
                <span className="font-bold">{roomLabel}</span> is being reviewed
                by the landlord. Please wait for approval.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (application.status === "approved") {
      const moveIn = application.move_in_date
        ? new Date(application.move_in_date).toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : null;

      return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-green-800 text-lg">
                Application Approved!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Welcome to TAHAN! Your room is{" "}
                <span className="font-bold">{roomLabel}</span>.
              </p>
              {moveIn ? (
                <p className="text-sm text-green-700 mt-1">
                  📅 Move-in date: <span className="font-bold">{moveIn}</span>
                </p>
              ) : (
                <p className="text-sm text-green-600 mt-1">
                  📅 Move-in date will be set by the landlord soon.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (application.status === "rejected") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">❌</span>
            <div>
              <p className="font-bold text-red-800 text-lg">
                Application Not Approved
              </p>
              <p className="text-sm text-red-700 mt-1">
                Your application for{" "}
                <span className="font-bold">{roomLabel}</span> was not approved.
                Please contact the landlord for more information.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-[#fdf6ec]">
      {/* Top nav */}
      <nav className="bg-white border-b border-[#ede0d0] px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#3b2314]">TAHAN</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {photoUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#5c3d2e]">
                <Image
                  src={photoUrl}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center text-sm font-bold">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm text-[#9c8878]">
              Hi,{" "}
              <span className="font-bold text-[#3b2314]">
                {user.name.split(" ")[0]}
              </span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-[#d6c4b0] text-[#5c3d2e] rounded-xl font-semibold hover:bg-[#f5ede0] transition"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-[#3b2314]">My Dashboard</h2>
          <p className="text-[#9c8878] text-sm mt-1">
            Tenant Portal · TAHAN Boarding House
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 mb-8 border-b border-[#ede0d0]">
          {(["overview", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-bold capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#5c3d2e] text-[#5c3d2e]"
                  : "border-transparent text-[#9c8878] hover:text-[#5c3d2e]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <>
            <ApplicationStatusCard />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "💳",
                  label: "Payments",
                  desc: "View rent payment history and due dates.",
                  soon: true,
                },
                {
                  icon: "💬",
                  label: "Messages",
                  desc: "Private chat with your landlord.",
                  soon: true,
                },
                {
                  icon: "👥",
                  label: "Group Chat",
                  desc: "Chat with all boarders and landlord.",
                  soon: true,
                },
                {
                  icon: "🔧",
                  label: "Maintenance",
                  desc: "Submit a repair or maintenance request.",
                  soon: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm relative"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-[#3b2314] mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[#9c8878]">{item.desc}</p>
                  {item.soon && (
                    <span className="absolute top-4 right-4 text-xs bg-[#f5ede0] text-[#9c8878] px-2 py-1 rounded-full font-semibold">
                      Coming soon
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-[#ede0d0] p-8 shadow-sm">
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                ✅ Profile updated successfully!
              </div>
            )}

            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {photoUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5c3d2e]">
                    <Image
                      src={photoUrl}
                      alt="profile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center text-3xl font-bold border-4 border-[#5c3d2e]">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#5c3d2e] text-white rounded-full flex items-center justify-center text-sm hover:bg-[#7a5240] transition shadow"
                  >
                    📷
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {editing && (
                <p className="text-xs text-[#9c8878] mt-2">
                  Click the camera icon to change photo
                </p>
              )}
              {!editing && (
                <div className="mt-3 text-center">
                  <p className="font-bold text-[#3b2314] text-lg">
                    {user.name}
                  </p>
                  <p className="text-sm text-[#9c8878]">{user.email}</p>
                  <span className="text-xs bg-[#f5ede0] text-[#5c3d2e] px-3 py-1 rounded-full font-semibold mt-1 inline-block capitalize">
                    {user.role}
                  </span>
                </div>
              )}
            </div>

            {!editing && (
              <>
                <div className="flex flex-col gap-0">
                  {[
                    { label: "Full Name", value: user.name },
                    { label: "Email", value: user.email },
                    { label: "Gender", value: user.gender ?? "—" },
                    {
                      label: "Contact Number",
                      value: user.contact_number ?? "—",
                    },
                    {
                      label: "Emergency Contact Name",
                      value: user.emergency_contact_name ?? "—",
                    },
                    {
                      label: "Emergency Contact Number",
                      value: user.emergency_contact_number ?? "—",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between py-3 border-b border-[#f0e6d6] last:border-0"
                    >
                      <span className="text-sm font-semibold text-[#9c8878]">
                        {row.label}
                      </span>
                      <span className="text-sm text-[#3b2314] font-medium">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-6 w-full py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm"
                >
                  ✏️ Edit Profile
                </button>
              </>
            )}

            {editing && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Full Name",
                      key: "name",
                      placeholder: "Juan Dela Cruz",
                    },
                    {
                      label: "Email",
                      key: "email",
                      placeholder: "juan@email.com",
                    },
                    {
                      label: "Contact Number",
                      key: "contact_number",
                      placeholder: "09XXXXXXXXX",
                    },
                    {
                      label: "Emergency Contact Name",
                      key: "emergency_contact_name",
                      placeholder: "Maria Dela Cruz",
                    },
                    {
                      label: "Emergency Contact Number",
                      key: "emergency_contact_number",
                      placeholder: "09XXXXXXXXX",
                    },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5c3d2e]">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#5c3d2e]">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, gender: e.target.value }))
                      }
                      className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="flex-1 py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
