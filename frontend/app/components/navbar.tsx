"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  name: string;
  email: string;
  role: "admin" | "tenant";
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* ignore network errors on logout */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  };

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <nav className="w-full bg-white border-b border-[#e8ddd0] px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-black text-[#3b2314] tracking-tight">
          TAHAN
        </span>
        <span className="hidden sm:block text-xs text-[#9c8878] font-medium mt-1">
          Boarding House
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* ── NOT logged in ── */}
        {!user && (
          <Link
            href="/login"
            className="text-sm font-semibold text-[#5c3d2e] hover:text-[#3b2314] transition px-3 py-2 rounded-lg hover:bg-[#f5ede0]"
          >
            Log In
          </Link>
        )}

        {/* ── Logged in ── */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f5ede0] transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center text-sm font-bold">
                {firstName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[#3b2314] hidden sm:block">
                {firstName}
              </span>
              {user.role === "admin" && (
                <span className="text-xs bg-[#3b2314] text-white px-2 py-0.5 rounded-full font-bold hidden sm:block">
                  Admin
                </span>
              )}
              <span className="text-[#9c8878] text-xs">▾</span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-[#e8ddd0] z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f0e6d6]">
                    <p className="text-sm font-bold text-[#3b2314]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#9c8878] truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {user.role === "admin" ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#f5ede0] transition"
                      >
                        🏠 Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#f5ede0] transition"
                        >
                          🏠 My Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#f5ede0] transition"
                        >
                          👤 My Profile
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#f0e6d6] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
