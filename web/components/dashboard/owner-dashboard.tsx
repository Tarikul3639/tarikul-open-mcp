"use client"

import axios from "axios"
import { CalendarDays, LoaderCircle, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { OwnerDashboardAccount } from "./owner-dashboard-account"
import { OwnerDashboardDeleteAccount } from "./owner-dashboard-delete-account"
import { OwnerDashboardCalendarConnect } from "./owner-dashboard-calendar-connect"
import { OwnerDashboardCalendarDisconnect } from "./owner-dashboard-calendar-disconnect"
import { OwnerDashboardClientManagement } from "./owner-dashboard-client-management"
import { OwnerDashboardHealth } from "./owner-dashboard-health"
import type { ClientAccess } from "@/types/client-access"

interface ClientsResponseDto {
  clients: ClientAccess[]
}

const LOGIN_HREF = "/api/auth/google?next=%2Fdashboard"

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
  const [loading, setLoading] = useState(true)
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(
    null
  )
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)

    try {
      const results = await Promise.allSettled([
        fetchUser(signal),
        fetchClientAccess(signal),
      ])

      if (signal?.aborted) return

      const [userResult, clientsResult] = results

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
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const loadCalendarStatus = useCallback(async () => {
    setCalendarLoading(true)

    try {
      const response = await axios.get("/api/auth/calendar/status", {
        withCredentials: true,
        headers: { "Cache-Control": "no-cache" },
      })

      setCalendarConnected(Boolean(response.data.connected))
    } catch (reason) {
      setCalendarConnected(null)
      setError(
        axios.isAxiosError(reason)
          ? responseError(reason, "Could not load Google Calendar status.")
          : "Could not load Google Calendar status."
      )
    } finally {
      setCalendarLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    void loadDashboard(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    })

    return () => controller.abort()
  }, [loadDashboard])

  useEffect(() => {
    if (user) {
      void loadCalendarStatus()
    } else {
      setCalendarConnected(null)
      setCalendarLoading(false)
    }
  }, [user, loadCalendarStatus])

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
        <OwnerDashboardHealth />
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
              setError("")
            }}
          />

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
                    <span className="text-sm text-[#FF6B5E]">
                      Status unavailable
                    </span>
                  ) : calendarConnected ? (
                    <span className="text-sm text-[#3DD68C]">Connected</span>
                  ) : (
                    <span className="text-sm text-[#8A8A8A]">Disconnected</span>
                  )}
                </div>

                <p className="mt-1 text-sm text-[#8A8A8A]">
                  Signed-in MCP clients use this connected calendar.
                </p>

                {!calendarLoading && calendarConnected === false && (
                  <OwnerDashboardCalendarConnect onError={setError} />
                )}

                {!calendarLoading && calendarConnected === true && (
                  <OwnerDashboardCalendarDisconnect
                    onDisconnected={() => {
                      setCalendarConnected(false)
                      setError("")
                    }}
                    onError={setError}
                  />
                )}
              </div>
            </li>

            <OwnerDashboardClientManagement
              clients={clients}
              onClientsChanged={setClients}
              onError={setError}
            />
          </ul>

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 border-t-2 border-[#2B2B2B] px-5 py-3 text-sm text-[#FF6B5E]"
            >
              {error}
            </p>
          )}

          <OwnerDashboardDeleteAccount
            onDeleted={() => {
              setUser(null)
              setClients([])
              setError("")
              window.location.href = "/"
            }}
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

function responseError(
  reason: { response?: { data?: { message?: string; error?: string } } },
  fallback: string
) {
  return (
    reason.response?.data?.message ?? reason.response?.data?.error ?? fallback
  )
}
