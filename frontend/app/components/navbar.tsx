"use client";
import Link from "next/link";
import Image from "next/image";
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
    <nav className="w-full bg-[#E1DBC9] border-b border-[#c8bfad] px-6 py-1 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/TAHANLOGO.png"
          alt="TAHAN Boarding House"
          width={60}
          height={24}
          className="object-contain"
          priority
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* ── NOT logged in ── */}
        {!user && (
          <Link
            href="/login"
            className="text-[12px] font-bold text-[#E1DBC9] bg-[#56392b] hover:bg-[#3b2314] transition px-3 py-1.5 rounded-md shadow-sm"
          >
            Log In
          </Link>
        )}

        {/* ── Logged in ── */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#5E4B3B]/10 transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#5E4B3B] text-[#E1DBC9] flex items-center justify-center text-sm font-bold">
                {firstName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[#3b2314] hidden sm:block">
                {firstName}
              </span>
              {user.role === "admin" && (
                <span className="text-xs bg-[#3b2314] text-[#E1DBC9] px-2 py-0.5 rounded-full font-bold hidden sm:block">
                  Admin
                </span>
              )}
              <span className="text-[#6B7B84] text-xs">▾</span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-52 bg-[#E1DBC9] rounded-2xl shadow-xl border border-[#c8bfad] z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#c8bfad]">
                    <p className="text-sm font-bold text-[#3b2314]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#6B7B84] truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {user.role === "admin" ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#5E4B3B]/10 transition"
                      >
                        🏠 Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#5E4B3B]/10 transition"
                        >
                          🏠 My Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3b2314] hover:bg-[#5E4B3B]/10 transition"
                        >
                          👤 My Profile
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#c8bfad] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition text-left"
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
