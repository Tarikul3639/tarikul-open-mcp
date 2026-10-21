"use client"

import { LoaderCircle, UserRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Space_Grotesk } from "next/font/google"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import type { User as UserResponseDto } from "@/types/user"

const font = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

function ProfileSkeleton() {
  return (
    <div
      className="flex animate-pulse items-center gap-2.5"
      role="status"
      aria-label="Loading profile"
    >
      <div className="h-9 w-9 rounded-full bg-white/10" />
      <div className="h-3.5 w-20 rounded bg-white/10" />
      <span className="sr-only">Loading profile...</span>
    </div>
  )
}

export default function SiteHeader() {
  const [user, setUser] = useState<UserResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUser() {
      try {
        const response = await axios.get<UserResponseDto>("/api/auth/me", {
          withCredentials: true,
          signal: controller.signal,
        })

        setUser(response.data)
      } catch (error) {
        if (!controller.signal.aborted && !axios.isCancel(error)) {
          setUser(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => controller.abort()
  }, [])

  function handleLogin() {
    if (isLoggingIn) return

    setIsLoggingIn(true)
    window.location.href = "/api/auth/google?next=%2Fdashboard"
  }

  return (
    <header className="rise flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href="/"
          aria-label="Tarikul's MCP home"
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-white"
        >
          <Image
            src="/tarikul-open-mcp-logo-yellow-black.png"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </Link>

        <Link
          href="/"
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
          className="flex min-w-0 items-center gap-2.5 rounded-full transition outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#F5C518] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          title={`Open dashboard for ${user.email || user.name}`}
          aria-label={`Open dashboard for ${user.name}`}
        >
          {user.picture ? (
            <Image
              src={user.picture}
              alt={`${user.name}'s profile`}
              width={36}
              height={36}
              unoptimized
              referrerPolicy="no-referrer"
              className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F5C518] text-black">
              <UserRound size={19} />
            </span>
          )}

          <span className="hidden max-w-36 truncate text-sm font-semibold sm:inline">
            {user.name}
          </span>
        </Link>
      ) : (
        <Button
          type="button"
          onClick={handleLogin}
          disabled={isLoggingIn}
          aria-busy={isLoggingIn}
          className="shrink-0 gap-2 rounded-md bg-[#F5C518] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#FFD84A] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingIn ? (
            <>
              <LoaderCircle
                size={16}
                strokeWidth={2.5}
                className="animate-spin"
                aria-hidden="true"
              />
              Connecting...
            </>
          ) : (
            "Login"
          )}
        </Button>
      )}
    </header>
  )
}
