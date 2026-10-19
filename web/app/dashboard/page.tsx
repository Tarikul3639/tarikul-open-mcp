import { Bricolage_Grotesque } from "next/font/google";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import SiteFooter from "@/components/home/site-footer";
import SiteHeader from "@/components/home/site-header";

const font = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });

const GRID_STYLE = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
  maskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
};

export default function DashboardPage() {
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
        <div className="rise mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C518]">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Personal dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            Manage your Google Calendar connection for remote MCP clients.
          </p>
        </div>
        <OwnerDashboard />
        <SiteFooter />
      </div>
    </main>
  );
}
