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

type Application = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  sex: string;
  contact: string;
  address: string;
  room_id: number;
  room_name?: string;
  status: "pending" | "approved" | "rejected";
  move_in_date?: string;
  created_at: string;
};

type Payment = {
  id: number;
  tenant_id: number;
  user_id: number;
  month: string;
  amount: number;
  status: "paid" | "unpaid";
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  tenant?: { first_name: string; last_name: string };
  user?: { name: string; email: string };
};

type MaintenanceRequest = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  photo?: string;
  status: "pending" | "in_progress" | "resolved";
  admin_response?: string;
  created_at: string;
  user?: { name: string; email: string };
  tenant?: { first_name: string; last_name: string; room_id: number };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "tenants" | "payments" | "maintenance"
  >("overview");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [appFilter, setAppFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [approveModal, setApproveModal] = useState<Application | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [viewModal, setViewModal] = useState<Application | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  // Maintenance states
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [maintenanceFilter, setMaintenanceFilter] = useState<
    "all" | "pending" | "in_progress" | "resolved"
  >("all");
  const [respondModal, setRespondModal] = useState<MaintenanceRequest | null>(
    null,
  );
  const [respondForm, setRespondForm] = useState({
    status: "in_progress",
    admin_response: "",
  });
  const [respondSaving, setRespondSaving] = useState(false);

  // Add payment modal
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    tenant_id: "",
    user_id: "",
    month: "",
    amount: "",
    due_date: "",
    notes: "",
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  const approvedApps = applications.filter((a) => a.status === "approved");
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
    setAdminName(user.name ?? "Admin");
    fetchAll();
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tenantsRes, appsRes, paymentsRes, maintenanceRes] =
        await Promise.all([
          fetch("http://localhost:8000/api/admin/tenants", {
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }),
          fetch("http://localhost:8000/api/admin/applications", {
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }),
          fetch("http://localhost:8000/api/admin/payments", {
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }),
          fetch("http://localhost:8000/api/admin/maintenance", {
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }),
        ]);
      if (tenantsRes.ok) setTenants(await tenantsRes.json());
      if (appsRes.ok) setApplications(await appsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (maintenanceRes.ok)
        setMaintenanceRequests(await maintenanceRes.json());
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveModal || !moveInDate) return;
    setActionLoading(approveModal.id);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/applications/${approveModal.id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ move_in_date: moveInDate }),
        },
      );
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === approveModal.id
              ? { ...a, status: "approved", move_in_date: moveInDate }
              : a,
          ),
        );
        setApproveModal(null);
        setMoveInDate("");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: Application) => {
    setActionLoading(app.id);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/applications/${app.id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: "rejected" } : a)),
        );
      }
    } finally {
      setActionLoading(null);
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
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
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

  const handleMarkPaid = async (payment: Payment) => {
    setActionLoading(payment.id);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/payments/${payment.id}/mark-paid`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_method: "Cash" }),
        },
      );
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === payment.id
              ? {
                  ...p,
                  status: "paid",
                  paid_date: new Date().toISOString().split("T")[0],
                  payment_method: "Cash",
                }
              : p,
          ),
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkUnpaid = async (payment: Payment) => {
    setActionLoading(payment.id);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/payments/${payment.id}/mark-unpaid`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === payment.id
              ? {
                  ...p,
                  status: "unpaid",
                  paid_date: undefined,
                  payment_method: undefined,
                }
              : p,
          ),
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPayment = async () => {
    if (
      !paymentForm.tenant_id ||
      !paymentForm.month ||
      !paymentForm.amount ||
      !paymentForm.due_date
    )
      return;
    setPaymentSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: parseInt(paymentForm.tenant_id),
          user_id: parseInt(paymentForm.user_id),
          month: paymentForm.month,
          amount: parseFloat(paymentForm.amount),
          due_date: paymentForm.due_date,
          notes: paymentForm.notes,
          status: "unpaid",
        }),
      });
      if (res.ok) {
        await fetchAll();
        setAddPaymentModal(false);
        setPaymentForm({
          tenant_id: "",
          user_id: "",
          month: "",
          amount: "",
          due_date: "",
          notes: "",
        });
      }
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleRespond = async () => {
    if (!respondModal) return;
    setRespondSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/maintenance/${respondModal.id}/respond`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(respondForm),
        },
      );
      if (res.ok) {
        setMaintenanceRequests((prev) =>
          prev.map((r) =>
            r.id === respondModal.id
              ? {
                  ...r,
                  status: respondForm.status as MaintenanceRequest["status"],
                  admin_response: respondForm.admin_response,
                }
              : r,
          ),
        );
        setRespondModal(null);
        setRespondForm({ status: "in_progress", admin_response: "" });
      }
    } finally {
      setRespondSaving(false);
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

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredApps = applications.filter((a) =>
    appFilter === "all" ? true : a.status === appFilter,
  );
  const filteredPayments = payments.filter((p) =>
    paymentFilter === "all" ? true : p.status === paymentFilter,
  );
  const filteredMaintenance = maintenanceRequests.filter((r) =>
    maintenanceFilter === "all" ? true : r.status === maintenanceFilter,
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    inactive: tenants.filter((t) => t.status === "inactive").length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    totalPaid: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalUnpaid: payments
      .filter((p) => p.status === "unpaid")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    pendingMaintenance: maintenanceRequests.filter(
      (r) => r.status === "pending",
    ).length,
  };

  const navItems = [
    { key: "overview", icon: "📊", label: "Dashboard", badge: 0 },
    {
      key: "applications",
      icon: "📋",
      label: "Applications",
      badge: stats.pending,
    },
    { key: "tenants", icon: "👥", label: "Tenant Management", badge: 0 },
    { key: "payments", icon: "💳", label: "Payments", badge: 0 },
    {
      key: "maintenance",
      icon: "🔧",
      label: "Maintenance",
      badge: stats.pendingMaintenance,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fdf6ec]">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-[#3b2314] min-h-screen flex flex-col transition-all duration-300 shrink-0`}
      >
        <div className="px-4 py-5 flex items-center justify-between border-b border-[#5c3d2e]">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-black text-white">TAHAN</h1>
              <p className="text-xs text-[#c4a882]">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#c4a882] hover:text-white transition text-lg"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-[#5c3d2e]">
            <div className="w-10 h-10 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center font-bold text-lg mb-2">
              {adminName[0]?.toUpperCase()}
            </div>
            <p className="text-white font-bold text-sm">{adminName}</p>
            <p className="text-[#c4a882] text-xs">Super Admin</p>
          </div>
        )}

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition relative ${
                activeTab === item.key
                  ? "bg-[#5c3d2e] text-white"
                  : "text-[#c4a882] hover:bg-[#5c3d2e]/50 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge > 0 && sidebarOpen && (
                <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.badge > 0 && !sidebarOpen && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#5c3d2e]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#c4a882] hover:text-white hover:bg-[#5c3d2e] rounded-xl transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-[#ede0d0] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-[#3b2314]">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "applications" && "Applications"}
              {activeTab === "tenants" && "Tenant Management"}
              {activeTab === "payments" && "Payments Management"}
              {activeTab === "maintenance" && "Maintenance Requests"}
            </h2>
            <p className="text-xs text-[#9c8878]">
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats.pending > 0 && (
              <div className="relative">
                <span className="text-2xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <p className="text-lg font-bold text-[#3b2314] mb-6">
                Welcome back,{" "}
                <span className="text-[#5c3d2e]">
                  {adminName.split(" ")[0]}!
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-[#9c8878] font-semibold uppercase tracking-wide">
                        Total Tenants
                      </p>
                      <p className="text-4xl font-black text-[#3b2314] mt-1">
                        {stats.total}
                      </p>
                    </div>
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">
                    {stats.active} active · {stats.inactive} inactive
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-[#9c8878] font-semibold uppercase tracking-wide">
                        Pending Applications
                      </p>
                      <p className="text-4xl font-black text-yellow-600 mt-1">
                        {stats.pending}
                      </p>
                    </div>
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="text-xs text-[#9c8878] font-semibold">
                    {stats.approved} approved · {stats.rejected} rejected
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#ede0d0] p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-[#9c8878] font-semibold uppercase tracking-wide">
                        Outstanding Payments
                      </p>
                      <p className="text-4xl font-black text-red-500 mt-1">
                        ₱{stats.totalUnpaid.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-3xl">💳</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">
                    ₱{stats.totalPaid.toLocaleString()} collected
                  </p>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-[#f0e6d6] flex justify-between items-center">
                  <h3 className="font-bold text-[#3b2314]">
                    Recent Applications
                  </h3>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="text-xs text-[#5c3d2e] font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-[#fdf6ec]">
                    <tr>
                      {["Tenant", "Room", "Applied", "Status", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-bold text-[#9c8878] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app, i) => (
                      <tr
                        key={app.id}
                        className={`border-t border-[#f5ede0] ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                      >
                        <td className="px-5 py-3 font-semibold text-[#3b2314]">
                          {app.first_name} {app.last_name}
                        </td>
                        <td className="px-5 py-3 text-[#9c8878]">
                          {app.room_name ?? `Room ${app.room_id}`}
                        </td>
                        <td className="px-5 py-3 text-[#9c8878]">
                          {new Date(app.created_at).toLocaleDateString(
                            "en-PH",
                            { month: "short", day: "numeric" },
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              app.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {app.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setApproveModal(app);
                                  setMoveInDate("");
                                  setActiveTab("applications");
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tenant accounts summary */}
              <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#f0e6d6] flex justify-between items-center">
                  <h3 className="font-bold text-[#3b2314]">Tenant Accounts</h3>
                  <button
                    onClick={() => setActiveTab("tenants")}
                    className="text-xs text-[#5c3d2e] font-bold hover:underline"
                  >
                    Manage All →
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-[#fdf6ec]">
                    <tr>
                      {["Name", "Email", "Status", "Action"].map((h) => (
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
                    {tenants.slice(0, 5).map((tenant, i) => (
                      <tr
                        key={tenant.id}
                        className={`border-t border-[#f5ede0] ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                      >
                        <td className="px-5 py-3 font-semibold text-[#3b2314]">
                          {tenant.name}
                        </td>
                        <td className="px-5 py-3 text-[#9c8878]">
                          {tenant.email}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${tenant.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => toggleStatus(tenant)}
                            disabled={actionLoading === tenant.id}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
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
            </>
          )}

          {/* ── APPLICATIONS TAB ── */}
          {activeTab === "applications" && (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setAppFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
                        appFilter === s
                          ? "bg-[#5c3d2e] text-white"
                          : "border border-[#d6c4b0] text-[#5c3d2e] hover:bg-[#f5ede0]"
                      }`}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>

              {loading ? (
                <p className="text-center text-[#9c8878] py-16 animate-pulse">
                  Loading…
                </p>
              ) : filteredApps.length === 0 ? (
                <p className="text-center text-[#9c8878] py-16">
                  No applications found.
                </p>
              ) : (
                <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#fdf6ec] border-b border-[#ede0d0]">
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Room",
                          "Applied",
                          "Status",
                          "Move-in",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-bold text-[#9c8878] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app, i) => (
                        <tr
                          key={app.id}
                          className={`border-b border-[#f5ede0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                        >
                          <td className="px-4 py-4 font-semibold text-[#3b2314]">
                            {app.first_name} {app.last_name}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {app.email}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {app.room_name ?? `Room ${app.room_id}`}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {new Date(app.created_at).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                app.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "rejected"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {app.move_in_date
                              ? new Date(app.move_in_date).toLocaleDateString(
                                  "en-PH",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setViewModal(app)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f5ede0] text-[#5c3d2e] hover:bg-[#e8d5c0] transition"
                              >
                                View
                              </button>
                              {app.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setApproveModal(app);
                                      setMoveInDate("");
                                    }}
                                    disabled={actionLoading === app.id}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(app)}
                                    disabled={actionLoading === app.id}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                  >
                                    {actionLoading === app.id ? "…" : "Reject"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── TENANTS TAB ── */}
          {activeTab === "tenants" && (
            <>
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

              {loading ? (
                <p className="text-[#9c8878] text-center py-16 animate-pulse">
                  Loading…
                </p>
              ) : filteredTenants.length === 0 ? (
                <p className="text-center text-[#9c8878] py-16">
                  No tenants found.
                </p>
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
                      {filteredTenants.map((tenant, i) => (
                        <tr
                          key={tenant.id}
                          className={`border-b border-[#f5ede0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                        >
                          <td className="px-5 py-4 font-semibold text-[#3b2314]">
                            {tenant.name}
                          </td>
                          <td className="px-5 py-4 text-[#9c8878]">
                            {tenant.email}
                          </td>
                          <td className="px-5 py-4 text-[#9c8878]">
                            {tenant.gender ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-[#9c8878]">
                            {tenant.contact_number ?? "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${tenant.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                            >
                              {tenant.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#9c8878]">
                            {new Date(tenant.created_at).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
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
            </>
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === "payments" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm text-center">
                  <p className="text-xs text-[#9c8878] font-semibold uppercase tracking-wide mb-1">
                    Total Records
                  </p>
                  <p className="text-3xl font-black text-[#3b2314]">
                    {payments.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-200 p-5 shadow-sm text-center">
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
                    Total Collected
                  </p>
                  <p className="text-3xl font-black text-green-700">
                    ₱{stats.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm text-center">
                  <p className="text-xs text-red-600 font-semibold uppercase tracking-wide mb-1">
                    Outstanding
                  </p>
                  <p className="text-3xl font-black text-red-600">
                    ₱{stats.totalUnpaid.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 justify-between items-center">
                <div className="flex gap-2">
                  {(["all", "paid", "unpaid"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPaymentFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
                        paymentFilter === s
                          ? "bg-[#5c3d2e] text-white"
                          : "border border-[#d6c4b0] text-[#5c3d2e] hover:bg-[#f5ede0]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAddPaymentModal(true)}
                  className="px-4 py-2 bg-[#5c3d2e] text-white text-sm font-bold rounded-xl hover:bg-[#7a5240] transition"
                >
                  + Add Payment Record
                </button>
              </div>

              {loading ? (
                <p className="text-center text-[#9c8878] py-16 animate-pulse">
                  Loading…
                </p>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">💳</p>
                  <p className="font-bold text-[#3b2314]">
                    No payment records yet
                  </p>
                  <p className="text-sm text-[#9c8878] mt-1">
                    Click "Add Payment Record" to create one.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#ede0d0] shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#fdf6ec] border-b border-[#ede0d0]">
                      <tr>
                        {[
                          "Tenant",
                          "Month",
                          "Amount",
                          "Due Date",
                          "Paid Date",
                          "Method",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-bold text-[#9c8878] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment, i) => (
                        <tr
                          key={payment.id}
                          className={`border-b border-[#f5ede0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fffaf4]"}`}
                        >
                          <td className="px-4 py-4 font-semibold text-[#3b2314]">
                            {payment.user?.name ??
                              payment.tenant?.first_name ??
                              `Tenant #${payment.tenant_id}`}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {payment.month}
                          </td>
                          <td className="px-4 py-4 font-bold text-[#3b2314]">
                            ₱{Number(payment.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
                            {new Date(payment.due_date).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-4 text-[#9c8878]">
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
                          <td className="px-4 py-4 text-[#9c8878]">
                            {payment.payment_method ?? "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {payment.status === "unpaid" ? (
                              <button
                                onClick={() => handleMarkPaid(payment)}
                                disabled={actionLoading === payment.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50"
                              >
                                {actionLoading === payment.id
                                  ? "…"
                                  : "Mark Paid"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkUnpaid(payment)}
                                disabled={actionLoading === payment.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                              >
                                {actionLoading === payment.id
                                  ? "…"
                                  : "Mark Unpaid"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── MAINTENANCE TAB ── */}
          {activeTab === "maintenance" && (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["all", "pending", "in_progress", "resolved"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setMaintenanceFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
                        maintenanceFilter === s
                          ? "bg-[#5c3d2e] text-white"
                          : "border border-[#d6c4b0] text-[#5c3d2e] hover:bg-[#f5ede0]"
                      }`}
                    >
                      {s === "in_progress" ? "In Progress" : s}
                    </button>
                  ),
                )}
              </div>

              {loading ? (
                <p className="text-center text-[#9c8878] py-16 animate-pulse">
                  Loading…
                </p>
              ) : filteredMaintenance.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔧</p>
                  <p className="font-bold text-[#3b2314]">
                    No maintenance requests
                  </p>
                  <p className="text-sm text-[#9c8878] mt-1">
                    Requests from tenants will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredMaintenance.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-[#ede0d0] p-5 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-[#3b2314]">
                            {req.title}
                          </h4>
                          <p className="text-xs text-[#9c8878]">
                            By {req.user?.name ?? "Unknown"} ·{" "}
                            {new Date(req.created_at).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            req.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : req.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {req.status === "in_progress"
                            ? "In Progress"
                            : req.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#9c8878] mb-3">
                        {req.description}
                      </p>
                      {req.photo && (
                        <img
                          src={`http://localhost:8000/storage/${req.photo}`}
                          alt="maintenance"
                          className="max-h-48 rounded-xl object-cover mb-3"
                        />
                      )}
                      {req.admin_response && (
                        <div className="bg-[#f5ede0] rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-[#5c3d2e] mb-1">
                            Your Response:
                          </p>
                          <p className="text-sm text-[#3b2314]">
                            {req.admin_response}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setRespondModal(req);
                          setRespondForm({
                            status: req.status,
                            admin_response: req.admin_response ?? "",
                          });
                        }}
                        className="px-4 py-2 bg-[#5c3d2e] text-white text-xs font-bold rounded-xl hover:bg-[#7a5240] transition"
                      >
                        {req.admin_response ? "Update Response" : "Respond"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-[#3b2314] mb-1">
              Approve Application
            </h3>
            <p className="text-sm text-[#9c8878] mb-6">
              Set the move-in date for{" "}
              <span className="font-bold text-[#3b2314]">
                {approveModal.first_name} {approveModal.last_name}
              </span>
            </p>
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Move-in Date
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="px-4 py-3 rounded-xl border border-[#e8ddd0] text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApproveModal(null);
                  setMoveInDate("");
                }}
                className="flex-1 py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!moveInDate || actionLoading !== null}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition text-sm disabled:opacity-50"
              >
                {actionLoading !== null ? "Approving…" : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-[#3b2314] mb-4">
              Application Details
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              {[
                {
                  label: "Full Name",
                  value: `${viewModal.first_name} ${viewModal.last_name}`,
                },
                { label: "Email", value: viewModal.email },
                { label: "Sex", value: viewModal.sex },
                { label: "Contact", value: viewModal.contact },
                { label: "Address", value: viewModal.address },
                {
                  label: "Room",
                  value: viewModal.room_name ?? `Room ${viewModal.room_id}`,
                },
                { label: "Status", value: viewModal.status },
                {
                  label: "Move-in Date",
                  value: viewModal.move_in_date ?? "Not set",
                },
                {
                  label: "Applied On",
                  value: new Date(viewModal.created_at).toLocaleDateString(
                    "en-PH",
                    { month: "long", day: "numeric", year: "numeric" },
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between border-b border-[#f0e6d6] pb-2 last:border-0"
                >
                  <span className="text-[#9c8878] font-semibold">
                    {row.label}
                  </span>
                  <span className="text-[#3b2314] font-medium capitalize">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setViewModal(null)}
              className="mt-6 w-full py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {addPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-[#3b2314] mb-4">
              Add Payment Record
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Select Tenant
                </label>
                <select
                  value={paymentForm.tenant_id}
                  onChange={(e) => {
                    const selected = approvedApps.find(
                      (a) => a.id === parseInt(e.target.value),
                    );
                    const matchedTenant = tenants.find(
                      (t) => t.email === selected?.email,
                    );
                    setPaymentForm((p) => ({
                      ...p,
                      tenant_id: e.target.value,
                      user_id: matchedTenant?.id?.toString() ?? "",
                      amount: selected
                        ? String(
                            selected.room_id === 1
                              ? 3500
                              : selected.room_id === 2
                                ? 1500
                                : selected.room_id === 3
                                  ? 4000
                                  : selected.room_id === 4
                                    ? 2000
                                    : selected.room_id === 5
                                      ? 1800
                                      : 5000,
                          )
                        : "",
                    }));
                  }}
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                >
                  <option value="">Select approved tenant…</option>
                  {approvedApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.first_name} {app.last_name} —{" "}
                      {app.room_name ?? `Room ${app.room_id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Month
                </label>
                <input
                  type="text"
                  placeholder="e.g. June 2026"
                  value={paymentForm.month}
                  onChange={(e) =>
                    setPaymentForm((p) => ({ ...p, month: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  placeholder="3500"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={paymentForm.due_date}
                  onChange={(e) =>
                    setPaymentForm((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. June rent"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setAddPaymentModal(false);
                  setPaymentForm({
                    tenant_id: "",
                    user_id: "",
                    month: "",
                    amount: "",
                    due_date: "",
                    notes: "",
                  });
                }}
                className="flex-1 py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={
                  paymentSaving ||
                  !paymentForm.tenant_id ||
                  !paymentForm.month ||
                  !paymentForm.amount ||
                  !paymentForm.due_date
                }
                className="flex-1 py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-50"
              >
                {paymentSaving ? "Saving…" : "Add Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-[#3b2314] mb-1">
              Respond to Request
            </h3>
            <p className="text-sm text-[#9c8878] mb-4 font-semibold">
              {respondModal.title}
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Update Status
                </label>
                <select
                  value={respondForm.status}
                  onChange={(e) =>
                    setRespondForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#5c3d2e]">
                  Response Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your response to the tenant…"
                  value={respondForm.admin_response}
                  onChange={(e) =>
                    setRespondForm((p) => ({
                      ...p,
                      admin_response: e.target.value,
                    }))
                  }
                  className="px-4 py-2 rounded-xl border border-[#e8ddd0] bg-white text-[#3b2314] focus:outline-none focus:ring-2 focus:ring-[#5c3d2e] transition text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRespondModal(null);
                  setRespondForm({ status: "in_progress", admin_response: "" });
                }}
                className="flex-1 py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                disabled={respondSaving}
                className="flex-1 py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-sm disabled:opacity-50"
              >
                {respondSaving ? "Saving…" : "Save Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
