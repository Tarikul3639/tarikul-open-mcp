import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "@/lib/seo"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: SITE_NAME,

  icons: {
    icon: SOCIAL_IMAGE,
    apple: SOCIAL_IMAGE,
  },

  keywords: [
    "Tarikul Open MCP",
    "Google Calendar MCP server",
    "Model Context Protocol",
    "ChatGPT Google Calendar integration",
    "remote MCP server",
    "AI calendar tools",
  ],

  authors: [{ name: "Tarikul Islam", url: "https://tarikul-islam.me/" }],
  creator: "Tarikul Islam",
  publisher: SITE_NAME,

  openGraph: {
    title: "Tarikul Open MCP | Google Calendar for AI Assistants",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
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
    title: "Tarikul Open MCP | Google Calendar for AI Assistants",
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
