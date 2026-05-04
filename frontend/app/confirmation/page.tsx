"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#fdf6ec] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-5xl">
          ✅
        </div>

        <h1 className="text-3xl font-black text-[#3b2314] mb-2">
          Application Submitted!
        </h1>
        <p className="text-[#9c8878] mb-8">
          Hi <span className="font-bold text-[#5c3d2e]">{user.name}</span>, your
          tenant application has been received. The landlord will review it and
          contact you at <span className="font-bold">{user.email}</span>.
        </p>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-[#ede0d0] p-6 text-left mb-8 shadow-sm">
          <p className="text-sm font-bold text-[#5c3d2e] uppercase tracking-wider mb-4">
            What happens next?
          </p>
          <ol className="flex flex-col gap-4">
            {[
              {
                step: "1",
                label: "Review",
                desc: "The landlord reviews your application (1–2 days).",
              },
              {
                step: "2",
                label: "Contact",
                desc: "You'll be contacted via email or phone for confirmation.",
              },
              {
                step: "3",
                label: "Move-in",
                desc: "Once approved, you'll set your move-in date and pay the downpayment.",
              },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#5c3d2e] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-[#3b2314] text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#9c8878]">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-[#5c3d2e] text-white font-bold rounded-xl hover:bg-[#7a5240] transition text-center block"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 border border-[#d6c4b0] text-[#5c3d2e] font-bold rounded-xl hover:bg-[#f5ede0] transition text-center block"
          >
            Back to Room Listings
          </Link>
        </div>
      </div>
    </main>
  );
}
