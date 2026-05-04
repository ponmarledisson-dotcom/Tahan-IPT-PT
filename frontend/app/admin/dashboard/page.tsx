"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tenant = {
  id: number;
  name: string;
  email: string;
  gender: string;
  contact_number: string;
  status: "active" | "inactive";
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const token = () => localStorage.getItem("token") ?? "";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(stored);
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchTenants();
  }, [router]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/tenants", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTenants(data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (tenant: Tenant) => {
    setActionLoading(tenant.id);
    const endpoint = tenant.status === "active" ? "deactivate" : "activate";
    try {
      await fetch(
        `http://localhost:8000/api/admin/tenants/${tenant.id}/${endpoint}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id
            ? {
                ...t,
                status: tenant.status === "active" ? "inactive" : "active",
              }
            : t,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8000/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    localStorage.clear();
    router.push("/");
  };

  const filtered = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    inactive: tenants.filter((t) => t.status === "inactive").length,
  };

  return (
    <main className="min-h-screen bg-[#fdf6ec]">
      {/* Nav */}
      <nav className="bg-[#3b2314] px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white">TAHAN</h1>
          <p className="text-xs text-[#c4a882]">Admin Panel</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 border border-[#c4a882] text-[#c4a882] rounded-xl font-semibold hover:bg-[#5c3d2e] transition"
        >
          Log Out
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-black text-[#3b2314] mb-2">
          Admin Dashboard
        </h2>
        <p className="text-[#9c8878] text-sm mb-8">
          Manage all tenant accounts
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Tenants",
              value: stats.total,
              color: "text-[#3b2314]",
            },
            { label: "Active", value: stats.active, color: "text-green-600" },
            { label: "Inactive", value: stats.inactive, color: "text-red-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm text-center"
            >
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9c8878] mt-1 font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-[#d6c4b0] bg-white text-sm text-[#3b2314] outline-none focus:ring-2 focus:ring-[#5c3d2e]/30"
          />
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
                  filterStatus === s
                    ? "bg-[#5c3d2e] text-white"
                    : "border border-[#d6c4b0] text-[#5c3d2e] hover:bg-[#f5ede0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tenants table */}
        {loading ? (
          <p className="text-[#9c8878] text-center py-16 animate-pulse">
            Loading tenants…
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#9c8878] py-16">No tenants found.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#fdf6ec] border-b border-[#ede0d0]">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Gender",
                    "Contact",
                    "Status",
                    "Joined",
                    "Action",
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
                {filtered.map((tenant, i) => (
                  <tr
                    key={tenant.id}
                    className={`border-b border-[#f5ede0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                  >
                    <td className="px-5 py-4 font-semibold text-[#3b2314]">
                      {tenant.name}
                    </td>
                    <td className="px-5 py-4 text-[#9c8878]">{tenant.email}</td>
                    <td className="px-5 py-4 text-[#9c8878]">
                      {tenant.gender ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[#9c8878]">
                      {tenant.contact_number ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          tenant.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#9c8878]">
                      {new Date(tenant.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(tenant)}
                        disabled={actionLoading === tenant.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                          tenant.status === "active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {actionLoading === tenant.id
                          ? "…"
                          : tenant.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
