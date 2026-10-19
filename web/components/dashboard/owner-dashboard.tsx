"use client";

import {
  CalendarDays,
  Check,
  CircleAlert,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type User = { name: string; email: string; picture: string | null };
type ClientAccess = {
  client_id: string;
  client_name: string | null;
  granted_at: string;
  revoked_at: string | null;
};
type Status = "checking" | "online" | "degraded";

const LOGIN_HREF = "/api/auth/login?next=%2Fdashboard";

const STATUS: Record<Status, { label: string; dot: string }> = {
  checking: { label: "Checking", dot: "bg-[#6B6B6B]" },
  online: { label: "Server online", dot: "bg-[#3DD68C]" },
  degraded: { label: "Service issue", dot: "bg-[#FF6B5E]" },
};

async function fetchUser(signal?: AbortSignal): Promise<User | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store", signal });
  const data = await response.json();
  return response.ok ? data.user : null;
}

async function fetchClientAccess(signal?: AbortSignal): Promise<ClientAccess[]> {
  const response = await fetch("/api/auth/clients", {
    cache: "no-store",
    signal,
  });
  const data = await response.json().catch(() => null);
  return response.ok && Array.isArray(data?.clients) ? data.clients : [];
}

const isAbort = (reason: unknown) =>
  reason instanceof Error && reason.name === "AbortError";

export default function OwnerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<ClientAccess[]>([]);
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revokingClient, setRevokingClient] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch("/api/health", { cache: "no-store", signal })
      .then((r) => setStatus(r.ok ? "online" : "degraded"))
      .catch((e) => {
        if (!isAbort(e)) setStatus("degraded");
      });

    fetchUser(signal)
      .then(setUser)
      .catch((e) => {
        if (!isAbort(e)) setUser(null);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    fetchClientAccess(signal)
      .then(setClients)
      .catch((e) => {
        if (!isAbort(e)) setClients([]);
      });

    return () => controller.abort();
  }, []);

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setClients([]);
  }

  async function updateClientAccess(clientId: string, restore: boolean) {
    setRevokingClient(clientId);
    setError("");

    try {
      const response = await fetch("/api/auth/clients", {
        method: restore ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not update client access.");
      }

      setClients((current) =>
        current.map((client) =>
          client.client_id === clientId
            ? {
                ...client,
                revoked_at: restore ? null : new Date().toISOString(),
              }
            : client,
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not update client access.",
      );
    } finally {
      setRevokingClient(null);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/disconnect", {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Could not disconnect this Google account.");
      setLoading(true);
      setUser(await fetchUser().catch(() => null));
      setClients([]);
      setLoading(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not disconnect this account.",
      );
    } finally {
      setBusy(false);
    }
  }

  const s = STATUS[status];

  return (
    <section
      aria-label="Connection dashboard"
      className="rise mt-10 overflow-hidden rounded-lg border-2 border-[#2B2B2B] bg-black"
    >
      {/* header */}
      <div className="flex items-center justify-between border-b-2 border-[#2B2B2B] px-5 py-3.5">
        <h2 className="text-base font-bold tracking-tight">Your connections</h2>
        <span className="flex items-center gap-2 text-sm text-[#8A8A8A]">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* body */}
      {loading ? (
        <div className="flex items-center gap-2 px-5 py-8 text-sm text-[#8A8A8A]">
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
                Each person signs in with Google. MCP clients use
                access only your calendar.
              </p>
            </div>
          </div>
          <a
            href={LOGIN_HREF}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#F5C518] px-5 text-sm font-bold text-black shadow-[3px_3px_0_#fff] transition hover:bg-[#FFD84A] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_#fff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C518]"
          >
            <CalendarDays size={16} strokeWidth={2.4} />
            Continue with Google
          </a>
        </div>
      ) : (
        <div>
          {/* account */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
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
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#F5C518] text-[#F5C518]">
                  <CalendarDays size={18} />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-[#8A8A8A]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-md border-2 border-[#2B2B2B] px-3 py-1.5 text-sm font-medium text-[#EDEDED] transition-colors hover:border-[#F5C518] hover:text-[#F5C518]"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>

          {/* connections */}
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
                  <span className="flex items-center gap-1 text-sm text-[#3DD68C]">
                    <Check size={14} strokeWidth={2.8} />
                    Connected
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#8A8A8A]">
                  Signed-in MCP clients use this connected calendar.
                </p>
                <button
                  onClick={() => void disconnect()}
                  disabled={busy}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-[#8A8A8A] transition-colors hover:text-[#FF6B5E] disabled:opacity-50"
                >
                  {busy ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Unplug size={14} />
                  )}
                  Disconnect Calendar
                </button>
              </div>
            </li>

            <li className="flex items-start gap-4 px-5 py-4">
              <ShieldCheck
                size={20}
                strokeWidth={2.2}
                className="mt-0.5 shrink-0 text-[#F5C518]"
              />
              <div>
                <p className="font-semibold">MCP access</p>
                <p className="mt-1 text-sm text-[#8A8A8A]">
                  Manage which clients can use this Google Calendar. Your
                  friend has a separate list for their account.
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
                              Boolean(client.revoked_at),
                            )
                          }
                          disabled={revokingClient !== null}
                          className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${client.revoked_at ? "border-[#F5C518] text-[#F5C518] hover:bg-[#F5C518] hover:text-black" : "border-[#454545] text-[#EDEDED] hover:border-[#FF6B5E] hover:text-[#FF6B5E]"}`}
                        >
                          {revokingClient === client.client_id ? (
                            <LoaderCircle size={13} className="animate-spin" />
                          ) : null}
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
                  Active access renews automatically. Remove it to block
                  current tokens and future renewals; restore it here to
                  reconnect the same client.
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
        </div>
      )}

      {/* footer */}
      <div className="flex items-center gap-2 border-t-2 border-[#2B2B2B] px-5 py-3 text-sm text-[#6B6B6B]">
        <ShieldCheck size={14} />
        Separate Google account · Per-user credentials · Short-lived MCP tokens
      </div>
    </section>
  );
}
