import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import Diagram from "@/components/home/diagram"
import AuthNotice from "@/components/home/auth-notice"
import FeaturesList from "@/components/home/features-list"
import IntroSection from "@/components/home/intro-section"
import SiteFooter from "@/components/home/site-footer"
import SiteHeader from "@/components/home/site-header"
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Google Calendar MCP Server for AI Assistants",
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | Google Calendar MCP Server for AI Assistants`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1254,
        height: 1254,
        alt: "Tarikul Open MCP logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Google Calendar MCP Server for AI Assistants`,
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
}

const font = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" })

const GRID_STYLE = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
  maskImage:
    "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
}

export default function Home() {
  return (
    <main
      className={`${font.className} relative min-h-screen overflow-hidden bg-black text-[#EDEDED] selection:bg-[#F5C518] selection:text-black`}
      style={{ colorScheme: "dark" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            author: {
              "@type": "Person",
              name: "Tarikul Islam",
              url: "https://tarikul-islam.me/",
            },
          }),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-140"
        style={GRID_STYLE}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-14">
        <SiteHeader />
        <AuthNotice />
        <IntroSection />

        <div className="rise mt-12" style={{ animationDelay: "340ms" }}>
          <Diagram />
        </div>

        <FeaturesList />
        <SiteFooter />
      </div>
    </main>
  )
}
