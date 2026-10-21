import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import { ConsentPanel } from "@/components/oauth/consent-panel"
import SiteFooter from "@/components/home/site-footer"
import SiteHeader from "@/components/home/site-header"

const font = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Authorize MCP client",
  robots: { index: false, follow: false },
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

export default function ConsentPage() {
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
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5C518] uppercase">
            Authorization
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Connect an MCP client
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            Review which app is asking to use this MCP server with your Google
            account.
          </p>
        </div>
        <ConsentPanel />
        <SiteFooter />
      </div>
    </main>
  )
}
