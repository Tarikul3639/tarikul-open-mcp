"use client"

import axios from "axios"
import { CalendarDays, LoaderCircle, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { OwnerDashboardAccount } from "./owner-dashboard-account"
import { OwnerDashboardConnections } from "./owner-dashboard-connections"
import type { ClientAccess } from "@/types/client-access"

type Status = "checking" | "online" | "degraded"

interface ClientsResponseDto {
  clients: ClientAccess[]
}

const LOGIN_HREF = "/api/auth/google?next=%2Fdashboard"

const STATUS: Record<Status, { label: string; dot: string }> = {
  checking: { label: "Checking", dot: "bg-[#6B6B6B]" },
  online: { label: "Server online", dot: "bg-[#3DD68C]" },
  degraded: { label: "Service issue", dot: "bg-[#FF6B5E]" },
}

const isAbort = (reason: unknown) =>
  axios.isCancel(reason) ||
  (axios.isAxiosError(reason) && reason.code === "ERR_CANCELED")

async function fetchUser(signal?: AbortSignal): Promise<User> {
  const response = await axios.get<User>("/api/auth/me", {
    signal,
    withCredentials: true,
    headers: { "Cache-Control": "no-cache" },
  })

  return response.data
}

async function fetchClientAccess(
  signal?: AbortSignal
): Promise<ClientAccess[]> {
  const response = await axios.get<ClientsResponseDto>("/api/auth/clients", {
    signal,
    withCredentials: true,
    headers: { "Cache-Control": "no-cache" },
  })

  return Array.isArray(response.data?.clients) ? response.data.clients : []
}

export default function OwnerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<ClientAccess[]>([])
  const [status, setStatus] = useState<Status>("checking")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [revokingClient, setRevokingClient] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)

    try {
      const results = await Promise.allSettled([
        fetchUser(signal),
        fetchClientAccess(signal),
        axios.get("/api/health", {
          signal,
          headers: { "Cache-Control": "no-cache" },
        }),
      ])

      if (signal?.aborted) return

      const [userResult, clientsResult, healthResult] = results

      if (userResult.status === "fulfilled") {
        setUser(userResult.value)
      } else if (!isAbort(userResult.reason)) {
        setUser(null)
      }

      if (clientsResult.status === "fulfilled") {
        setClients(clientsResult.value)
      } else if (!isAbort(clientsResult.reason)) {
        setClients([])
      }

      setStatus(
        healthResult.status === "fulfilled" &&
          healthResult.value.status >= 200 &&
          healthResult.value.status < 300
          ? "online"
          : "degraded"
      )
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    void loadDashboard(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setStatus("degraded")
        setLoading(false)
      }
    })

    return () => controller.abort()
  }, [loadDashboard])

  const currentStatus = STATUS[status]

  function handleLogin() {
    if (isLoggingIn) return

    setIsLoggingIn(true)
    window.location.href = LOGIN_HREF
  }

  return (
    <section
      aria-label="Connection dashboard"
      className="rise mt-10 overflow-hidden rounded-lg border-2 border-[#2B2B2B] bg-black"
    >
      <div className="flex items-center justify-between border-b-2 border-[#2B2B2B] px-5 py-3.5">
        <h2 className="text-base font-bold tracking-tight">Your connections</h2>

        <span className="flex items-center gap-2 text-sm text-[#8A8A8A]">
          <span className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
          {currentStatus.label}
        </span>
      </div>

      {loading ? (
        <div
          className="flex items-center gap-2 px-5 py-8 text-sm text-[#8A8A8A]"
          role="status"
        >
          <LoaderCircle className="animate-spin" size={16} />
          Checking your account…
        </div>
      ) : !user ? (
        <div className="px-5 py-6">
          <div className="flex items-start gap-4">
            <CalendarDays
              size={20}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-[#F5C518]"
            />

            <div>
              <p className="font-semibold">Connect your own Google Calendar</p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-[#8A8A8A]">
                Each person signs in with Google. MCP clients use access only
                your calendar.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            aria-busy={isLoggingIn}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#F5C518] px-5 text-sm font-bold text-black shadow-[3px_3px_0_#fff] transition hover:bg-[#FFD84A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C518] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_#fff] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingIn ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <CalendarDays size={16} strokeWidth={2.4} />
                Continue with Google
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <OwnerDashboardAccount
            user={user}
            onSignedOut={() => {
              setUser(null)
              setClients([])
            }}
          />

          <OwnerDashboardConnections
            clients={clients}
            busy={busy}
            revokingClient={revokingClient}
            error={error}
            onDisconnected={() => {
              void loadDashboard().catch(() => {
                setError("Unable to refresh your account. Please try again.")
                setLoading(false)
              })
            }}
            onClientsChanged={setClients}
            onError={(message) => {
              setError(message)
              setBusy(false)
              setRevokingClient(null)
            }}
            onBusyChange={setBusy}
            onRevokingClientChange={setRevokingClient}
          />
        </>
      )}

      <div className="flex items-center gap-2 border-t-2 border-[#2B2B2B] px-5 py-3 text-sm text-[#6B6B6B]">
        <ShieldCheck size={14} />
        Separate Google account · Per-user credentials · Short-lived MCP tokens
      </div>
    </section>
  )
}
