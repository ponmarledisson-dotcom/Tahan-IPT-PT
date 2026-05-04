"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  gender?: string;
  contact_number?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile">(
    "overview",
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.push("/login");
      return;
    }

    // Verify token with backend
    fetch("http://localhost:8000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
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
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center">
        <p className="text-[#9c8878] animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#fdf6ec]">
      {/* Top nav */}
      <nav className="bg-white border-b border-[#ede0d0] px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#3b2314]">TAHAN</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#9c8878]">
            Hi,{" "}
            <span className="font-bold text-[#3b2314]">
              {user.name.split(" ")[0]}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-[#d6c4b0] text-[#5c3d2e] rounded-xl font-semibold hover:bg-[#f5ede0] transition"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
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
                <h3 className="font-bold text-[#3b2314] mb-1">{item.label}</h3>
                <p className="text-sm text-[#9c8878]">{item.desc}</p>
                {item.soon && (
                  <span className="absolute top-4 right-4 text-xs bg-[#f5ede0] text-[#9c8878] px-2 py-1 rounded-full font-semibold">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-[#ede0d0] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#3b2314] mb-6">
              My Profile
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Full Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Gender", value: user.gender ?? "—" },
                { label: "Contact Number", value: user.contact_number ?? "—" },
                { label: "Role", value: user.role },
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
            <button className="mt-6 w-full py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-sm">
              Edit Profile (coming soon)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
