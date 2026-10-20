"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  CalendarDays,
  Check,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  Unplug,
  Link2,
} from "lucide-react"
import type { ClientAccess } from "@/types/client-access"

type OwnerDashboardConnectionsProps = {
  clients: ClientAccess[]
  busy: boolean
  revokingClient: string | null
  error: string
  onDisconnected: () => void
  onClientsChanged: (clients: ClientAccess[]) => void
  onError: (message: string) => void
  onBusyChange: (busy: boolean) => void
  onRevokingClientChange: (clientId: string | null) => void
}

export function OwnerDashboardConnections({
  clients,
  busy,
  revokingClient,
  error,
  onDisconnected,
  onClientsChanged,
  onError,
  onBusyChange,
  onRevokingClientChange,
}: OwnerDashboardConnectionsProps) {
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(
    null
  )
  const [calendarLoading, setCalendarLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadCalendarStatus() {
      try {
        const response = await axios.get("/api/auth/calendar/status")

        if (active) {
          setCalendarConnected(Boolean(response.data.connected))
        }
      } catch (reason) {
        if (active) {
          onError(
            axios.isAxiosError(reason)
              ? (reason.response?.data?.message ??
                reason.response?.data?.error ??
                "Could not load Google Calendar status.")
              : "Could not load Google Calendar status."
          )
        }
      } finally {
        if (active) setCalendarLoading(false)
      }
    }

    void loadCalendarStatus()

    return () => {
      active = false
    }
  }, [onError])

  async function connectCalendar() {
    if (busy) return

    onBusyChange(true)
    onError("")

    try {
      const response = await axios.post("/api/auth/calendar/connect")
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
      onBusyChange(false)
    }
  }

  async function disconnect() {
    if (busy) return

    onBusyChange(true)
    onError("")

    try {
      await axios.delete("/api/auth/calendar/disconnect")
      setCalendarConnected(false)
      onDisconnected()
    } catch (reason) {
      onError(
        axios.isAxiosError(reason)
          ? (reason.response?.data?.message ??
            reason.response?.data?.error ??
            "Could not disconnect Google Calendar.")
          : "Could not disconnect this account."
      )
      onBusyChange(false)
    }
  }

  async function updateClientAccess(clientId: string, restore: boolean) {
    if (revokingClient !== null) return

    onRevokingClientChange(clientId)
    onError("")

    try {
      if (restore) {
        await axios.post("/api/auth/clients", {
          client_id: clientId,
        })
      } else {
        await axios.delete("/api/auth/clients", {
          data: { client_id: clientId },
        })
      }

      onClientsChanged(
        clients.map((client) =>
          client.client_id === clientId
            ? {
              ...client,
              revoked_at: restore ? null : new Date().toISOString(),
            }
            : client
        )
      )
    } catch (reason) {
      onError(
        axios.isAxiosError(reason)
          ? (reason.response?.data?.message ??
            reason.response?.data?.error ??
            "Could not update client access.")
          : "Could not update client access."
      )
    } finally {
      onRevokingClientChange(null)
    }
  }

  return (
    <>
      <ul className="divide-y divide-white/10 border-t-2 border-[#2B2B2B]">
        <li className="flex items-start gap-4 px-5 py-4">
          <CalendarDays
            size={20}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0 text-[#F5C518]"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">Google Calendar</p>

              {calendarLoading ? (
                <span className="flex items-center gap-1 text-sm text-[#8A8A8A]">
                  <LoaderCircle size={14} className="animate-spin" />
                  Checking
                </span>
              ) : calendarConnected === null ? (
                <span className="flex items-center gap-1 text-sm text-[#FF6B5E]">
                  <CircleAlert size={14} />
                  Status unavailable
                </span>
              ) : calendarConnected ? (
                <span className="flex items-center gap-1 text-sm text-[#3DD68C]">
                  <Check size={14} strokeWidth={2.8} />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-[#8A8A8A]">
                  <CircleAlert size={14} />
                  Disconnected
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[#8A8A8A]">
              Signed-in MCP clients use this connected calendar.
            </p>

            {!calendarLoading && calendarConnected !== null && (
              <button
                type="button"
                onClick={() =>
                  void (calendarConnected ? disconnect() : connectCalendar())
                }
                disabled={busy}
                title={
                  calendarConnected
                    ? "Disconnect Google Calendar"
                    : "Connect Google Calendar"
                }
                className={`mt-2.5 inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${calendarConnected
                    ? "text-[#8A8A8A] hover:text-[#FF6B5E]"
                    : "text-[#F5C518] hover:text-white"
                  }`}
              >
                {busy ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : calendarConnected ? (
                  <Unplug size={14} />
                ) : (
                  <Link2 size={14} />
                )}
                {calendarConnected ? "Disconnect Calendar" : "Connect Calendar"}
              </button>
            )}
          </div>
        </li>

        <li className="flex items-start gap-4 px-5 py-4">
          <ShieldCheck
            size={20}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0 text-[#F5C518]"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">MCP access</p>
            <p className="mt-1 text-sm text-[#8A8A8A]">
              Manage which clients can use this Google Calendar. Your friend has
              a separate list for their account.
            </p>

            {clients.length ? (
              <ul className="mt-3 divide-y divide-[#2B2B2B] border-y border-[#2B2B2B]">
                {clients.map((client) => (
                  <li
                    key={client.client_id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {client.client_name || "MCP client"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B6B6B]">
                        {client.revoked_at
                          ? `Access removed ${new Date(client.revoked_at).toLocaleDateString()}`
                          : `Connected ${new Date(client.granted_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void updateClientAccess(
                          client.client_id,
                          Boolean(client.revoked_at)
                        )
                      }
                      disabled={revokingClient !== null}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${client.revoked_at
                          ? "border-[#F5C518] text-[#F5C518] hover:bg-[#F5C518] hover:text-black"
                          : "border-[#454545] text-[#EDEDED] hover:border-[#FF6B5E] hover:text-[#FF6B5E]"
                        }`}
                    >
                      {revokingClient === client.client_id && (
                        <LoaderCircle size={13} className="animate-spin" />
                      )}
                      {client.revoked_at ? "Restore access" : "Remove access"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#6B6B6B]">
                No MCP clients have connected yet.
              </p>
            )}

            <p className="mt-2 text-xs text-[#6B6B6B]">
              Active access renews automatically. Remove it to block current
              tokens and future renewals; restore it here to reconnect the same
              client.
            </p>
          </div>
        </li>
      </ul>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 border-t-2 border-[#2B2B2B] px-5 py-3 text-sm text-[#FF6B5E]"
        >
          <CircleAlert size={15} />
          {error}
        </p>
      )}
    </>
  )
}
