import type { NextConfig } from "next"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      {
        source: "/.well-known/:path*",
        destination: `${backendUrl}/.well-known/:path*`,
      },
    ]
  },
}

export default nextConfig
