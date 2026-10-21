import { Bricolage_Grotesque } from "next/font/google"
import {
  CalendarDays,
  Check,
  CircleHelp,
  KeyRound,
  ListChecks,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import SiteFooter from "@/components/home/site-footer"
import SiteHeader from "@/components/home/site-header"
import EndpointConnect from "@/components/home/endpoint-connect"

const font = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
})

export const metadata = {
  title: "Documentation | Tarikul's MCP",
  description:
    "Connect a Google Calendar account to Tarikul's remote MCP server, authorize clients, and see the available calendar tools.",
}

const GRID_STYLE = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
  maskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
}

const STEPS = [
  {
    number: "01",
    title: "Sign in to the dashboard",
    text: "Choose Continue with Google. This signs you in and creates your personal account on the server; it does not connect Google Calendar yet.",
    Icon: UserRound,
  },
  {
    number: "02",
    title: "Connect Google Calendar",
    text: "In the dashboard, choose Connect Calendar and approve the requested read/write Google Calendar access. Calendar credentials are stored on the server for your account.",
    Icon: CalendarDays,
  },
  {
    number: "03",
    title: "Add the remote server to your MCP client",
    text: "Use the endpoint below in a client that supports Streamable HTTP and OAuth. The client discovers the authorization flow from the server automatically.",
    Icon: KeyRound,
  },
  {
    number: "04",
    title: "Review and approve the client",
    text: "The client opens a browser page showing which MCP client is requesting access. Sign in if prompted, check the client name, then choose Allow access. Approval is saved separately for each user and client.",
    Icon: Check,
  },
  {
    number: "05",
    title: "Use your calendar tools",
    text: "Your assistant can now read or change events in the primary Google Calendar connected to your account. If you approved the client before connecting Calendar, connect it from the dashboard; you do not need to set up the client again.",
    Icon: CalendarDays,
  },
]

const TOOLS = [
  [
    "calendar_list_events",
    "List upcoming events from your primary calendar. Optional maxResults is 1–100; defaults to 10.",
  ],
  [
    "calendar_find_events_by_date",
    "List events between startDate and endDate (ISO 8601 with timezone); returns up to 100.",
  ],
  ["calendar_find_event", "Get an event by its Google Calendar eventId."],
  [
    "calendar_create_event",
    "Create an event with summary and start/end times; description and Google colorId are optional.",
  ],
  [
    "calendar_update_event",
    "Update an event's summary, description, start/end times, or colorId; omitted fields stay unchanged.",
  ],
  ["calendar_delete_event", "Permanently delete an event by its eventId."],
  ["health_check", "Check that the MCP server is running."],
  [
    "example_tool",
    "Echo a message; a simple tool for checking a client connection.",
  ],
]

function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold tracking-[0.18em] text-[#F5C518] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {children && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#8A8A8A]">
          {children}
        </p>
      )}
    </div>
  )
}

export default function DocsPage() {
  return (
    <main
      className={`${font.className} relative min-h-screen overflow-hidden bg-black text-[#EDEDED] selection:bg-[#F5C518] selection:text-black`}
      style={{ colorScheme: "dark" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-140"
        style={GRID_STYLE}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-14">
        <SiteHeader />

        <header className="rise mt-12 sm:mt-16">
          <p className="text-xs font-bold tracking-[0.2em] text-[#F5C518] uppercase">
            Documentation
          </p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
            Connect your calendar to your AI client.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#8A8A8A]">
            Connect Google Calendar once, add this remote MCP server to a
            compatible client, and approve that client in your browser. Calendar
            access is scoped to the Google account you connect.
          </p>

          <EndpointConnect />
        </header>

        <section className="rise mt-12" aria-label="Connection flow">
          <SectionTitle
            eyebrow="Connection flow"
            title="Connect once, then use your tools"
          />

          <ol className="divide-y-2 divide-[#242424] border-y-2 border-[#242424]">
            {STEPS.map(({ number, title, text, Icon }) => (
              <li key={number} className="flex gap-4 py-5 sm:gap-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-[#F5C518] bg-[#F5C518] text-black">
                  <Icon size={20} strokeWidth={2.4} />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#F5C518]">
                    STEP {number}
                  </p>
                  <h3 className="mt-1 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rise mt-12" aria-label="Personal accounts">
          <SectionTitle
            eyebrow="Personal accounts"
            title="Each person keeps a separate calendar"
          >
            Multiple people can use the same server. Each person signs in with
            Google, connects their own Calendar, and approves MCP clients for
            their account.
          </SectionTitle>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                name: "Your Google account",
                detail:
                  "Your Google sign-in → your stored Calendar credentials → your primary Calendar",
              },
              {
                name: "Another user",
                detail:
                  "Their Google sign-in → their stored Calendar credentials → their primary Calendar",
              },
            ].map(({ name, detail }) => (
              <div
                key={name}
                className="border-2 border-[#2B2B2B] bg-black p-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <UserRound size={16} className="text-[#F5C518]" />
                  {name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-3 border-l-2 border-[#F5C518] bg-[#111] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#F5C518]" />
            <p className="text-sm leading-relaxed text-[#B1B1B1]">
              Every MCP access token identifies one Google account. Calendar
              tools use that identity for every request, so a client authorized
              for one account cannot switch to another account’s Calendar.
            </p>
          </div>
        </section>

        <section className="rise mt-12" aria-label="Available tools">
          <SectionTitle
            eyebrow="Available tools"
            title="What an AI assistant can do"
          >
            Calendar tools work with the signed-in account’s primary Google
            Calendar. Event creation and changes happen using the Google account
            that signed in.
          </SectionTitle>

          <ul className="divide-y divide-[#242424] border-y-2 border-[#242424]">
            {TOOLS.map(([name, description]) => (
              <li
                key={name}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <code className="shrink-0 text-sm font-semibold text-[#F5C518]">
                  {name}
                </code>
                <span className="text-sm text-[#8A8A8A]">{description}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-[#8A8A8A]">
            <ListChecks size={18} className="mt-0.5 shrink-0 text-[#F5C518]" />
            <p>
              Event times use ISO 8601 date-time values with a timezone, such as{" "}
              <code className="text-[#CFCFCF]">2026-10-22T14:00:00+06:00</code>.
              Create and update currently support the fields listed above.
            </p>
          </div>
        </section>

        <section className="rise mt-12" aria-label="Security details">
          <SectionTitle
            eyebrow="Security"
            title="Account access stays separate and revocable"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-[#2B2B2B] p-4">
              <KeyRound size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Google sign-in</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Signing in identifies your account. Connecting Google Calendar
                is a separate step that requests calendar access. Each MCP
                client then needs your approval for that account.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <ShieldCheck size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Short-lived access</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Authorization codes use PKCE and expire after 5 minutes. MCP
                access tokens expire after 15 minutes and are renewed using
                rotating refresh tokens. Refresh tokens have a 30-day lifetime.
                Removing an MCP client in the dashboard blocks its access
                immediately.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CalendarDays size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Server-side credentials</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Google credentials are stored on the server per account and are
                not sent to the browser or MCP client.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CircleHelp size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Manage access</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                The dashboard lists MCP clients for your Google account. Remove
                access there to block that client’s current tokens and future
                renewals, or restore it later to reconnect. The list shows the
                client name supplied during connection; it cannot identify a
                specific AI model.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CalendarDays size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Disconnect Calendar</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Disconnecting removes this server's saved Calendar credentials.
                MCP client grants remain listed until you remove them. Calendar
                tools work again after you reconnect Calendar.
              </p>
            </div>
          </div>
        </section>

        <section className="rise mt-12" aria-label="Troubleshooting">
          <SectionTitle
            eyebrow="Troubleshooting"
            title="Quick fixes for common connection issues"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-[#2B2B2B] p-4">
              <h3 className="font-bold">
                Calendar tools say Calendar is not connected
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Open the dashboard and connect Google Calendar. Approving an MCP
                client and granting Google Calendar access are separate steps.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <h3 className="font-bold">
                The OAuth client or redirect is rejected
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Start authorization from the MCP client so it can register its
                callback address. Use the exact server endpoint shown above and
                do not edit the generated redirect URL.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <h3 className="font-bold">
                You want to stop one client’s access
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                In the dashboard, remove that MCP client under MCP access. Its
                tokens stop working immediately. Disconnect Calendar separately
                to remove the Calendar credentials stored by this server.
              </p>
            </div>
          </div>
        </section>

        <div className="rise mt-12 flex flex-col gap-3 border-2 border-[#F5C518] bg-[#111] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Ready to connect?</h2>
            <p className="mt-1 text-sm text-[#8A8A8A]">
              Sign in to see your connection status and manage your account.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex min-h-11 shrink-0 items-center justify-center bg-[#F5C518] px-4 text-sm font-bold text-black transition-colors hover:bg-[#FFD84A]"
          >
            Open dashboard
          </Link>
        </div>

        <SiteFooter />
      </div>
    </main>
  )
}
