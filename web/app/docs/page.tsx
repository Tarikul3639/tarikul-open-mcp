import { Bricolage_Grotesque } from "next/font/google";
import {
  CalendarDays,
  Check,
  CircleHelp,
  KeyRound,
  ListChecks,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/components/home/site-footer";
import SiteHeader from "@/components/home/site-header";

const font = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "How it works | Tarikul's MCP",
  description:
    "Learn how personal Google Calendar accounts connect to the remote MCP server and how sign-in authorizes calendar access.",
};

const GRID_STYLE = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
  maskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
};

const STEPS = [
  {
    number: "01",
    title: "Sign in with your Google account",
    text: "Open the dashboard and choose Login. Google confirms your identity and asks you to grant this server Calendar access. Your account is stored separately from every other user.",
    Icon: UserRound,
  },
  {
    number: "02",
    title: "Connect an MCP client",
    text: "Add this server’s remote endpoint to an MCP client that supports Streamable HTTP. The endpoint is on the current site at /api/mcp. The client discovers the OAuth sign-in flow automatically.",
    Icon: KeyRound,
  },
  {
    number: "03",
    title: "Sign in with Google when prompted",
    text: "Use the Google account whose calendar you want the client to access. Once signed in, the server completes the OAuth connection automatically.",
    Icon: Check,
  },
  {
    number: "04",
    title: "Ask your assistant to manage events",
    text: "The MCP client can call calendar tools with your account. Every access token is tied to the Google account that signed in.",
    Icon: CalendarDays,
  },
];

const TOOLS = [
  ["listCalendarEvents", "Show the next 10 upcoming events."],
  [
    "findCalendarEventsByDate",
    "Find a matching date among the next 10 upcoming events.",
  ],
  ["getCalendarEvent", "Get an event by its Google Calendar event ID."],
  [
    "createCalendarEvent",
    "Create an event with time, guests, reminders, and more.",
  ],
  ["updateCalendarEvent", "Change fields on an existing event."],
  ["deleteCalendarEvent", "Delete an event by its ID."],
  ["ping", "Check that the MCP server responds."],
];

function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5C518]">
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
  );
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5C518]">
            Documentation
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            How the system works.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#8A8A8A]">
            Your AI client connects to this MCP server. The server
            uses your own Google authorization to work with your
            Calendar, after you sign in with that account.
          </p>

          <div className="mt-6 inline-flex max-w-full items-center gap-3 overflow-hidden rounded-lg border-2 border-[#F5C518] bg-black px-4 py-3 shadow-[4px_4px_0_#F5C518]">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#F5C518]">
              Endpoint
            </span>
            <code className="truncate text-sm text-white">
              /api/mcp
            </code>
          </div>
        </header>

        <section className="rise mt-12" aria-label="Connection flow">
          <SectionTitle
            eyebrow="Connection flow"
            title="From sign-in to calendar tools"
          />

          <ol className="divide-y-2 divide-[#242424] border-y-2 border-[#242424]">
            {STEPS.map(({ number, title, text, Icon }) => (
              <li
                key={number}
                className="flex gap-4 py-5 sm:gap-5"
              >
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
            title="You and your friend keep separate calendars"
          >
            Both of you can use the same server. Each person signs
            in with their own Google account. The server uses
            that account for the client connection.
          </SectionTitle>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                name: "Your account",
                detail: "Your Google sign-in → your stored credentials → your primary Calendar",
              },
              {
                name: "Friend’s account",
                detail: "Their Google sign-in → their stored credentials → their primary Calendar",
              },
            ].map(({ name, detail }) => (
              <div
                key={name}
                className="border-2 border-[#2B2B2B] bg-black p-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <UserRound
                    size={16}
                    className="text-[#F5C518]"
                  />
                  {name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-3 border-l-2 border-[#F5C518] bg-[#111] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#F5C518]"
            />
            <p className="text-sm leading-relaxed text-[#B1B1B1]">
              Every MCP access token identifies one Google
              account. Calendar tools use that identity for every
              request, so a client authorized for one account
              cannot switch to another account’s Calendar.
            </p>
          </div>
        </section>

        <section className="rise mt-12" aria-label="Available tools">
          <SectionTitle
            eyebrow="Available tools"
            title="What an AI assistant can do"
          >
            Calendar tools work with the signed-in account’s
            primary Google Calendar. Event creation and changes
            happen using the Google account that signed in.
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
                <span className="text-sm text-[#8A8A8A]">
                  {description}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-[#8A8A8A]">
            <ListChecks
              size={18}
              className="mt-0.5 shrink-0 text-[#F5C518]"
            />
            <p>
              Create and update tools also support event
              descriptions, locations, attendees, color,
              reminders, visibility, transparency, and recurrence.
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
              <KeyRound
                size={19}
                className="text-[#F5C518]"
              />
              <h3 className="mt-3 font-bold">Google sign-in</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                The signed-in Google account determines which
                Calendar the MCP client can use. Each person signs
                in separately for their own account. The first
                connection creates a persistent grant for that
                client and account.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <ShieldCheck
                size={19}
                className="text-[#F5C518]"
              />
              <h3 className="mt-3 font-bold">
                Short-lived access
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Authorization codes use PKCE and expire after
                5 minutes. MCP access tokens expire after 15
                minutes and are renewed using rotating refresh
                tokens. Refresh tokens stay active until you
                remove the client from the dashboard or
                disconnect Google Calendar.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CalendarDays
                size={19}
                className="text-[#F5C518]"
              />
              <h3 className="mt-3 font-bold">
                Server-side credentials
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Google credentials are stored on the server per
                account and are not sent to the browser or MCP
                client.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CircleHelp
                size={19}
                className="text-[#F5C518]"
              />
              <h3 className="mt-3 font-bold">Manage access</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                The dashboard lists MCP clients for your Google
                account. Remove access there to block that
                client’s current tokens and future renewals, or
                restore it later to reconnect.
                The list shows the client name supplied during
                connection; it cannot identify a specific AI model.
              </p>
            </div>

            <div className="border-2 border-[#2B2B2B] p-4">
              <CalendarDays size={19} className="text-[#F5C518]" />
              <h3 className="mt-3 font-bold">Disconnect Calendar</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
                Disconnecting Google Calendar removes the saved
                account credentials and revokes every MCP client
                grant for that account.
              </p>
            </div>
          </div>
        </section>

        <div className="rise mt-12 flex flex-col gap-3 border-2 border-[#F5C518] bg-[#111] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Ready to connect?</h2>
            <p className="mt-1 text-sm text-[#8A8A8A]">
              Sign in to see your connection status and manage
              your account.
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
  );
}
