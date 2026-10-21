"use client"

import axios from "axios"
import { useState } from "react"
import { Link2, LoaderCircle } from "lucide-react"

type OwnerDashboardCalendarConnectProps = {
  onError: (message: string) => void
}

export function OwnerDashboardCalendarConnect({
  onError,
}: OwnerDashboardCalendarConnectProps) {
  const [connecting, setConnecting] = useState(false)

  async function connectCalendar() {
    if (connecting) return

    setConnecting(true)
    onError("")

    try {
      const response = await axios.post(
        "/api/auth/calendar/connect",
        {},
        { withCredentials: true }
      )

      const authorizationUrl = response.data.authorizationUrl

      if (typeof authorizationUrl !== "string" || !authorizationUrl) {
        throw new Error("Google Calendar authorization URL was not returned.")
      }

      window.location.assign(authorizationUrl)
    } catch (reason) {
      onError(
        axios.isAxiosError(reason)
          ? (reason.response?.data?.message ??
              reason.response?.data?.error ??
              "Could not connect Google Calendar.")
          : reason instanceof Error
            ? reason.message
            : "Could not connect Google Calendar."
      )

      setConnecting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void connectCalendar()}
      disabled={connecting}
      aria-busy={connecting}
      className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-[#F5C518] transition-colors hover:text-white disabled:opacity-50"
    >
      {connecting ? (
        <LoaderCircle size={14} className="animate-spin" />
      ) : (
        <Link2 size={14} />
      )}
      {connecting ? "Connecting..." : "Connect Calendar"}
    </button>
  )
}
