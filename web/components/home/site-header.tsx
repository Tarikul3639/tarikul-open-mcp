
"use client";

import { Plug, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { useEffect, useState } from "react";

const font = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

type User = {
  name: string;
  email?: string;
  picture?: string | null;
};

function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-2.5">
      <div className="h-9 w-9 rounded-full bg-white/10" />
      <div className="h-3.5 w-20 rounded bg-white/10" />
    </div>
  );
}

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data?.user ?? null);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  return (
    <header className="rise flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link href="/" aria-label="Tarikul's MCP home" className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#F5C518] text-black">
          <Plug size={23} strokeWidth={2.4} />
        </Link>

        <Link href="/"
          className={`${font.className} truncate text-base font-bold tracking-tight`}
        >
          Tarikul&apos;s MCP
        </Link>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : user ? (
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5 rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#F5C518] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          title={`Open dashboard for ${user.email || user.name}`}
          aria-label={`Open dashboard for ${user.name}`}
        >
            {user.picture ? (
              <Image src={user.picture} alt={`${user.name}'s profile`} width={36} height={36} unoptimized referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover" />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F5C518] text-black"><UserRound size={19} /></span>
            )}
            <span className="hidden max-w-36 truncate text-sm font-semibold sm:inline">{user.name}</span>
        </Link>
      ) : (
        <a
          href="/api/auth/login?next=%2Fdashboard"
          className="shrink-0 rounded-md bg-[#F5C518] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#FFD84A] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
        >
          Login
        </a>
      )}
    </header>
  );
}
