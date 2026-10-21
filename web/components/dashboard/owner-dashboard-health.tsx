"use client"

import axios from "axios"
import { useEffect, useState } from "react"

type HealthStatus = "checking" | "online" | "degraded"

const STATUS: Record<HealthStatus, { label: string; dot: string }> = {
  checking: { label: "Checking", dot: "bg-[#6B6B6B]" },
  online: { label: "Server online", dot: "bg-[#3DD68C]" },
  degraded: { label: "Service issue", dot: "bg-[#FF6B5E]" },
}

export function OwnerDashboardHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking")

  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      try {
        const response = await axios.get("/api/health", {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        })

        if (!controller.signal.aborted) {
          setStatus(
            response.status >= 200 && response.status < 300
              ? "online"
              : "degraded"
          )
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus("degraded")
        }
      }
    }

    void checkHealth()

    return () => controller.abort()
  }, [])

  const currentStatus = STATUS[status]

  return (
    <span
      className="flex items-center gap-2 text-sm text-[#8A8A8A]"
      role="status"
      aria-live="polite"
    >
      <span className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
      {currentStatus.label}
    </span>
  )
}
