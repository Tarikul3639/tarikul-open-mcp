import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tarikuls-mcp.vercel.app"),

  title: {
    default: "Tarikul's MCP",
    template: "%s | Tarikul's MCP",
  },

  description:
    "Tarikul's personal Model Context Protocol (MCP) server for connecting AI assistants with Google Calendar and future productivity tools like Gmail.",

  applicationName: "Tarikul's MCP",

  keywords: [
    "Tarikul's MCP",
    "MCP Server",
    "Model Context Protocol",
    "Google Calendar MCP",
    "Gmail MCP",
    "AI Tools",
    "AI Productivity",
    "Personal MCP Server",
  ],

  authors: [{ name: "Tarikul" }],
  creator: "Tarikul",

  openGraph: {
    title: "Tarikul's MCP",
    description:
      "Connect AI assistants with Google Calendar and productivity tools through Tarikul's MCP server.",
    url: "https://tarikuls-mcp.vercel.app",
    siteName: "Tarikul's MCP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/tarikuls-mcp.png",
        width: 1200,
        height: 630,
        alt: "Tarikul's MCP - Personal MCP Server",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Tarikul's MCP",
    description:
      "A personal MCP server for Google Calendar and AI-powered productivity integrations.",
    images: ["/tarikuls-mcp.png"],
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
