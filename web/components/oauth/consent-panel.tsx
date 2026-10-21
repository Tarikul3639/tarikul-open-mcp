"use client"

import axios from "axios"
import {
  CalendarDays,
  Check,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "@/types/user"

// Parameters forwarded from GET /api/auth/authorize.
const AUTH_PARAMS = [
  "client_id",
  "redirect_uri",
  "response_type",
  "code_challenge",
  "code_challenge_method",
  "state",
  "scope",
  "resource",
] as const

type AuthParams = Partial<Record<(typeof AUTH_PARAMS)[number], string>>

interface ClientInfo {
  client_id: string
  client_name: string | null
  redirect_uri: string
}

type ViewState =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "login"; client: ClientInfo }
  | {
      kind: "ready"
      client: ClientInfo
      user: User
      calendarConnected: boolean | null
    }
  | { kind: "redirecting"; approved: boolean }

const PERMISSIONS = [
  "See your upcoming Google Calendar events",
  "Find events by ID or date range",
  "Create and update events",
  "Delete events",
]

function readParams(): AuthParams {
  const search = new URLSearchParams(window.location.search)
  const params: AuthParams = {}

  for (const key of AUTH_PARAMS) {
    const value = search.get(key)
    if (value) params[key] = value
  }

  return params
}

function describeRedirect(uri: string): string {
  try {
    const url = new URL(uri)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.host
      : `${url.protocol}//`
  } catch {
    return uri
  }
}

function errorMessage(reason: unknown, fallback: string): string {
  if (axios.isAxiosError(reason)) {
    const data = reason.response?.data as
      { message?: string | string[]; error_description?: string } | undefined
    const message = Array.isArray(data?.message)
      ? data?.message.join(", ")
      : data?.message
    return data?.error_description ?? message ?? fallback
  }

  return fallback
}

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#F5C518] px-5 text-sm font-bold text-black shadow-[3px_3px_0_#fff] transition hover:bg-[#FFD84A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C518] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_#fff] disabled:cursor-not-allowed disabled:opacity-70"

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-2 border-[#2B2B2B] px-5 text-sm font-semibold text-[#EDEDED] transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"

export function ConsentPanel() {
  const [view, setView] = useState<ViewState>({ kind: "loading" })
  const [submitting, setSubmitting] = useState<"allow" | "deny" | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    const current = readParams()

    async function load() {
      if (
        !current.client_id ||
        !current.redirect_uri ||
        !current.code_challenge ||
        current.code_challenge_method !== "S256" ||
        current.response_type !== "code"
      ) {
        setView({
          kind: "invalid",
          message:
            "This authorization link is incomplete. Start the connection again from your MCP client.",
        })
        return
      }

      let client: ClientInfo

      try {
        const response = await axios.get<ClientInfo>(
          "/api/auth/authorize/client",
          {
            signal: controller.signal,
            params: {
              client_id: current.client_id,
              redirect_uri: current.redirect_uri,
            },
          }
        )
        client = response.data
      } catch (reason) {
        if (controller.signal.aborted) return
        setView({
          kind: "invalid",
          message: errorMessage(
            reason,
            "This MCP client is not registered or its redirect address is not allowed."
          ),
        })
        return
      }

      let user: User

      try {
        const response = await axios.get<User>("/api/auth/me", {
          signal: controller.signal,
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" },
        })
        user = response.data
      } catch {
        if (controller.signal.aborted) return
        setView({ kind: "login", client })
        return
      }

      let calendarConnected: boolean | null = null

      try {
        const response = await axios.get<{ connected: boolean }>(
          "/api/auth/calendar/status",
          { signal: controller.signal, withCredentials: true }
        )
        calendarConnected = Boolean(response.data.connected)
      } catch {
        calendarConnected = null
      }

      if (controller.signal.aborted) return
      setView({ kind: "ready", client, user, calendarConnected })
    }

    void load()

    return () => controller.abort()
  }, [])

  // After Google login the user returns to this exact page with the same
  // authorization parameters, so the MCP flow can continue.
  function loginHref(): string {
    const next = `${window.location.pathname}${window.location.search}`
    return `/api/auth/google?next=${encodeURIComponent(next)}`
  }

  async function decide(decision: "allow" | "deny") {
    if (submitting) return

    setSubmitting(decision)
    setError("")

    try {
      const response = await axios.post<{ redirectUrl: string }>(
        "/api/auth/authorize/consent",
        { ...readParams(), decision },
        { withCredentials: true }
      )

      setView({ kind: "redirecting", approved: decision === "allow" })
      window.location.assign(response.data.redirectUrl)
    } catch (reason) {
      setError(
        errorMessage(
          reason,
          "Could not complete authorization. Please try again."
        )
      )
      setSubmitting(null)
    }
  }

  return (
    <section
      aria-label="MCP client authorization"
      className="rise mt-10 max-w-2xl overflow-hidden rounded-lg border-2 border-[#2B2B2B] bg-black"
    >
      {view.kind === "loading" && (
        <div
          className="flex items-center gap-2 px-5 py-8 text-sm text-[#8A8A8A]"
          role="status"
        >
          <LoaderCircle className="animate-spin" size={16} />
          Checking the authorization request…
        </div>
      )}

      {view.kind === "invalid" && (
        <div className="flex items-start gap-4 px-5 py-6">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold">Authorization request is not valid</p>
            <p className="mt-1 text-sm leading-relaxed text-[#8A8A8A]">
              {view.message}
            </p>
          </div>
        </div>
      )}

      {view.kind === "login" && (
        <div className="px-5 py-6">
          <ClientHeading client={view.client} />
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">
            Sign in with Google first. You will come back to this page to
            approve or deny the request.
          </p>
          <a href={loginHref()} className={`${PRIMARY_BUTTON} mt-5`}>
            <CalendarDays size={16} strokeWidth={2.4} />
            Continue with Google
          </a>
        </div>
      )}

      {view.kind === "ready" && (
        <>
          <div className="border-b-2 border-[#2B2B2B] px-5 py-5">
            <ClientHeading client={view.client} />
            <p className="mt-3 text-sm text-[#8A8A8A]">
              Signed in as{" "}
              <span className="font-semibold text-[#EDEDED]">
                {view.user.email}
              </span>
            </p>
          </div>

          <div className="border-b-2 border-[#2B2B2B] px-5 py-5">
            <p className="text-sm font-semibold">This app will be able to:</p>
            <ul className="mt-3 space-y-2">
              {PERMISSIONS.map((permission) => (
                <li
                  key={permission}
                  className="flex items-start gap-2 text-sm text-[#CFCFCF]"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-[#F5C518]" />
                  {permission}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#8A8A8A]">
              After approval you will be sent back to{" "}
              <span className="font-mono whitespace-nowrap text-[#CFCFCF]">
                {describeRedirect(view.client.redirect_uri)}
              </span>
              . You can revoke access at any time from your{" "}
              <Link href="/dashboard" className="underline underline-offset-2">
                dashboard
              </Link>
              .
            </p>

            {view.calendarConnected === false && (
              <p className="mt-4 rounded-md border border-[#F5C518]/30 bg-[#F5C518]/10 px-3 py-2 text-xs leading-relaxed text-[#F5C518]">
                Your Google Calendar is not connected yet. You can approve now,
                but calendar tools will fail until you connect it from the{" "}
                <Link
                  href="/dashboard"
                  className="underline underline-offset-2"
                >
                  dashboard
                </Link>
                .
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 px-5 py-5">
            <button
              type="button"
              onClick={() => void decide("allow")}
              disabled={submitting !== null}
              aria-busy={submitting === "allow"}
              className={PRIMARY_BUTTON}
            >
              {submitting === "allow" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} strokeWidth={2.4} />
              )}
              Allow access
            </button>
            <button
              type="button"
              onClick={() => void decide("deny")}
              disabled={submitting !== null}
              aria-busy={submitting === "deny"}
              className={SECONDARY_BUTTON}
            >
              {submitting === "deny" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <X size={16} strokeWidth={2.4} />
              )}
              Deny
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-5 mb-5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}
        </>
      )}

      {view.kind === "redirecting" && (
        <div
          className="flex items-center gap-2 px-5 py-8 text-sm text-[#8A8A8A]"
          role="status"
        >
          <LoaderCircle className="animate-spin" size={16} />
          {view.approved
            ? "Access approved. Returning to your MCP client…"
            : "Access denied. Returning to your MCP client…"}
        </div>
      )}
    </section>
  )
}

function ClientHeading({ client }: { client: ClientInfo }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-[#F5C518] text-[#F5C518]">
        <ShieldCheck size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold tracking-tight">
          {client.client_name ?? "An MCP client"} wants to access your account
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-[#8A8A8A]">
          {client.client_id}
        </p>
      </div>
    </div>
  )
}
