"use client"

import axios from "axios"
import { CalendarDays, LoaderCircle, LogOut } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export type User = {
  name: string
  email: string
  picture: string | null
}

type OwnerDashboardAccountProps = {
  user: User
  onSignedOut: () => void
}

export function OwnerDashboardAccount({
  user,
  onSignedOut,
}: OwnerDashboardAccountProps) {
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState("")

  async function signOut() {
    if (signingOut) return

    setSigningOut(true)
    setError("")

    try {
      await axios.delete("/api/auth/session")
      onSignedOut()
    } catch (reason) {
      setError(
        axios.isAxiosError(reason)
          ? reason.response?.data?.message ??
          reason.response?.data?.error ??
          "Could not sign out. Please try again."
          : "Could not sign out. Please try again."
      )
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="border-b-2 border-[#2B2B2B] px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {user.picture ? (
            <Image
              src={user.picture}
              alt=""
              width={40}
              height={40}
              unoptimized
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full border-2 border-[#F5C518] object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#F5C518] text-[#F5C518]">
              <CalendarDays size={18} />
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-[#8A8A8A]">
              {user.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          aria-busy={signingOut}
          title="Sign out for this session"
          className="inline-flex items-center gap-2 rounded-md border-2 border-[#2B2B2B] px-3 py-1.5 text-sm font-medium text-[#EDEDED] transition-colors hover:border-[#F5C518] hover:text-[#F5C518] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {signingOut ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <LogOut size={14} />
          )}
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#FF6B5E]">
          {error}
        </p>
      )}
    </div>
  )
}