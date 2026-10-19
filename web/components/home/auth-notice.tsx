"use client";

import { useEffect, useRef, useState } from "react";

export default function AuthNotice() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "success") {
      setMessage("Google Calendar connected successfully!");
    } else if (auth === "error") {
      setMessage("Google authentication failed. Please try again.");
    } else {
      return;
    }

    window.history.replaceState({}, "", "/");
    timer.current = setTimeout(() => setMessage(""), 30000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
        message.includes("successfully")
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {message}
    </div>
  );
}
