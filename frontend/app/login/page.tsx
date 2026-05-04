"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.includes("@")) e.email = "Enter a valid email address.";
    if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message ?? "Invalid email or password." });
        return;
      }

      // Store Sanctum token + user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrors({
        general: "Could not connect to server. Is Laravel running?",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf6ec] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#3b2314] tracking-tight">
            TAHAN
          </h1>
          <p className="text-sm text-[#9c8878] mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#ede0d0] p-8">
          {/* General error */}
          {errors.general && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="you@email.com"
                className={`w-full px-4 py-3 rounded-xl border text-[#3b2314] bg-[#fff8f0] placeholder-[#c4b5a5] text-sm outline-none transition
                  focus:ring-2 focus:ring-[#5c3d2e]/40 focus:border-[#5c3d2e]
                  ${errors.email ? "border-red-400 bg-red-50" : "border-[#d6c4b0]"}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#5c3d2e]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Your password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-[#3b2314] bg-[#fff8f0] placeholder-[#c4b5a5] text-sm outline-none transition
                    focus:ring-2 focus:ring-[#5c3d2e]/40 focus:border-[#5c3d2e]
                    ${errors.password ? "border-red-400 bg-red-50" : "border-[#d6c4b0]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9c8878] hover:text-[#5c3d2e] transition text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-[#9c8878]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[#5c3d2e] font-bold hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>

        {/* Back to listings */}
        <p className="text-center text-sm text-[#b5a598] mt-6">
          <Link href="/" className="hover:text-[#5c3d2e] transition">
            ← Back to room listings
          </Link>
        </p>
      </div>
    </main>
  );
}
