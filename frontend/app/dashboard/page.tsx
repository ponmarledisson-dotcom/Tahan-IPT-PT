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

type Payment = {
  id: number;
  month: string;
  amount: number;
  status: "paid" | "unpaid";
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
};

type MaintenanceRequest = {
  id: number;
  title: string;
  description: string;
  photo?: string;
  status: "pending" | "in_progress" | "resolved";
  admin_response?: string;
  created_at: string;
};

// ── Maintenance Tab Component ─────────────────────────────────────────────────
function MaintenanceTab({ userId }: { userId: number }) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem("token") ?? "";

  useEffect(() => {
    fetch("http://localhost:8000/api/maintenance", {
      headers: {
        Authorization: `Bearer ${token()}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
        setLoadingReqs(false);
      })
      .catch(() => setLoadingReqs(false));
  }, [userId]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (photoFile) formData.append("photo", photoFile);

    try {
      const res = await fetch("http://localhost:8000/api/maintenance", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => [data.maintenance, ...prev]);
        setForm({ title: "", description: "" });
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowForm(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status: string) => {
    if (status === "resolved") return "bg-green-100 text-green-700";
    if (status === "in_progress") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const statusLabel = (status: string) => {
    if (status === "in_progress") return "In Progress";
    if (status === "resolved") return "Resolved";
    return "Pending";
  };

  return (
    <div className="flex flex-col gap-6">
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          ✅ Maintenance request submitted successfully!
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#3b2314] text-lg">
            Maintenance Requests
          </h3>
          <p className="text-sm text-[#9c8878]">
            Submit and track repair requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#5c3d2e] text-white text-sm font-bold rounded-xl hover:bg-[#7a5240] transition"
        >
          {showForm ? "Cancel" : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm">
          <h4 className="font-bold text-[#3b2314] mb-4">
            New Maintenance Request
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Leaking faucet in bathroom"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Description
              </label>
              <textarea
                placeholder="Describe the issue in detail…"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Photo (optional)
              </label>
              <div
                onClick={() => photoRef.current?.click()}
                className="border-2 border-dashed border-[#d6c4b0] rounded-xl p-4 text-center cursor-pointer hover:border-[#5c3d2e] transition"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="preview"
                    className="max-h-40 mx-auto rounded-lg object-cover"
                  />
                ) : (
                  <p className="text-sm text-[#9c8878]">
                    📷 Click to upload a photo
                  </p>
                )}
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                submitting || !form.title.trim() || !form.description.trim()
              }
              className="w-full py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      {loadingReqs ? (
        <p className="text-center text-[#9c8878] py-12 animate-pulse">
          Loading…
        </p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede0d0] p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🔧</p>
          <p className="font-bold text-[#3b2314]">No requests yet</p>
          <p className="text-sm text-[#9c8878] mt-1">
            Click "+ New Request" to submit one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-[#3b2314]">{req.title}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyle(req.status)}`}
                >
                  {statusLabel(req.status)}
                </span>
              </div>
              <p className="text-sm text-[#9c8878] mb-2">{req.description}</p>
              {req.photo && (
                <img
                  src={`http://localhost:8000/storage/${req.photo}`}
                  alt="maintenance"
                  className="max-h-40 rounded-xl object-cover mb-2"
                />
              )}
              <p className="text-xs text-[#9c8878]">
                Submitted:{" "}
                {new Date(req.created_at).toLocaleDateString("en-PH", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {req.admin_response && (
                <div className="mt-3 bg-[#f5ede0] rounded-xl p-3">
                  <p className="text-xs font-bold text-[#5c3d2e] mb-1">
                    Admin Response:
                  </p>
                  <p className="text-sm text-[#3b2314]">{req.admin_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingApp, setLoadingApp] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
  "overview" | "payments" | "maintenance" | "profile"
>("overview");
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
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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

        return fetch(`http://localhost:8000/api/tenants`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      })
      .then((res) => res?.json())
      .then((tenants) => {
        // Fix: always set loadingApp to false, show no application if no match
        if (Array.isArray(tenants)) {
          const userEmail = storedUser.email;
          const match = tenants.find((t: Application) => t.email === userEmail);
          setApplication(match ?? null);
        } else {
          setApplication(null);
        }
        setLoadingApp(false);

        const token = localStorage.getItem("token");
        return fetch("http://localhost:8000/api/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      })
      .then((res) => res?.json())
      .then((data) => {
        if (Array.isArray(data)) setPayments(data);
        setLoadingPayments(false);
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
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
        setPhotoPreview(null);
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
      return `http://localhost:8000/uploads/${user.profile_photo}`;
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

    // No tenant record at all - user registered without picking a room
    if (!application) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🏠</span>
            <div>
              <p className="font-bold text-amber-800 text-lg">
                You haven't chosen a room yet
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You need to pick a room or bedspace before you can move in.{" "}
                <a href="/" className="font-bold underline text-amber-800">
                  Browse available rooms →
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
                by the landlord.
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
                RIGHT MOVE! Application Approved!
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
                Please contact the landlord.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalUnpaid = payments
    .filter((p) => p.status === "unpaid")
    .reduce((sum, p) => sum + p.amount, 0);

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
                  unoptimized={true}
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
        <div className="flex gap-2 mb-8 border-b border-[#ede0d0] overflow-x-auto">
          {(["overview", "payments", "maintenance", "profile"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-bold capitalize transition border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#5c3d2e] text-[#5c3d2e]"
                    : "border-transparent text-[#9c8878] hover:text-[#5c3d2e]"
                }`}
              >
                {tab}
              </button>
            ),
          )}
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
                  tab: "payments",
                },
                {
                  icon: "💬",
                  label: "Messages",
                  desc: "Private chat with your landlord.",
                  tab: null,
                  href: "/messages",
                },
                {
                  icon: "👥",
                  label: "Group Chat",
                  desc: "Chat with all boarders and landlord.",
                  tab: null,
                  href: "/group-chat",
                },
                {
                  icon: "🔧",
                  label: "Maintenance",
                  desc: "Submit a repair or maintenance request.",
                  tab: "maintenance",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                    else if (item.tab)
                      setActiveTab(item.tab as typeof activeTab);
                  }}
                  className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm relative cursor-pointer hover:border-[#5c3d2e] hover:shadow-md transition"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-[#3b2314] mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[#9c8878]">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm text-center">
                <p className="text-xs text-[#9c8878] font-semibold uppercase tracking-wide mb-1">
                  Total Payments
                </p>
                <p className="text-3xl font-black text-[#3b2314]">
                  {payments.length}
                </p>
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5 shadow-sm text-center">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
                  Total Paid
                </p>
                <p className="text-3xl font-black text-green-700">
                  ₱{totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm text-center">
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wide mb-1">
                  Outstanding
                </p>
                <p className="text-3xl font-black text-red-600">
                  ₱{totalUnpaid.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0e6d6]">
                <h3 className="font-bold text-[#3b2314]">Payment History</h3>
              </div>
              {loadingPayments ? (
                <p className="text-center text-[#9c8878] py-12 animate-pulse">
                  Loading payments…
                </p>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">💳</p>
                  <p className="font-bold text-[#3b2314]">
                    No payment records yet
                  </p>
                  <p className="text-sm text-[#9c8878] mt-1">
                    Your payment history will appear here once the landlord adds
                    records.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#fdf6ec] border-b border-[#ede0d0]">
                    <tr>
                      {[
                        "Month",
                        "Amount",
                        "Due Date",
                        "Paid Date",
                        "Method",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-bold text-[#9c8878] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, i) => (
                      <tr
                        key={payment.id}
                        className={`border-b border-[#f5ede0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                      >
                        <td className="px-5 py-4 font-semibold text-[#3b2314]">
                          {payment.month}
                        </td>
                        <td className="px-5 py-4 text-[#3b2314] font-bold">
                          ₱{Number(payment.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-[#9c8878]">
                          {new Date(payment.due_date).toLocaleDateString(
                            "en-PH",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#9c8878]">
                          {payment.paid_date
                            ? new Date(payment.paid_date).toLocaleDateString(
                                "en-PH",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-[#9c8878]">
                          {payment.payment_method ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Maintenance tab */}
        {activeTab === "maintenance" && <MaintenanceTab userId={user.id} />}

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
                      unoptimized={true}
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