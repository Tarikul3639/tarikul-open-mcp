"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Plug } from "lucide-react";

const subscribe = () => () => { };
const getUrl = () => `${window.location.origin}/api/mcp`;
const getServerUrl = () => "/api/mcp";

export default function EndpointConnect() {
  const url = useSyncExternalStore(subscribe, getUrl, getServerUrl);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (copyTimer.current) clearTimeout(copyTimer.current);

      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [url]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  return (
    <div className="rise mt-8" style={{ animationDelay: "240ms" }}>
      <div className="flex overflow-hidden rounded-lg border-2 border-[#F5C518] bg-black shadow-[4px_4px_0_#F5C518]">
        <span className="hidden w-11 shrink-0 place-items-center border-r-2 border-[#F5C518] bg-[#F5C518] text-black sm:grid">
          <Plug size={18} strokeWidth={2.4} />
        </span>
        <code className="min-w-0 flex-1 truncate px-3.5 py-3 text-sm sm:text-[15px]">
          {url}
        </code>
        <button
          onClick={copyUrl}
          aria-label="Copy endpoint URL"
          className="flex min-h-11 w-auto min-w-20 shrink-0 items-center justify-center gap-1.5 bg-[#F5C518] px-3 text-xs font-semibold text-black transition-all hover:bg-[#FFD84A] hover:text-base focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-black active:bg-[#E0B410] sm:w-28 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {copied ? (
            <span key="done" className="pop flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
              <Check size={16} strokeWidth={2.6} />
              Copied
            </span>
          ) : (
            <span key="copy" className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
              <Copy size={16} strokeWidth={2.4} />
              Copy
            </span>
          )}
        </button>
      </div>
      <p className="mt-3 text-sm text-[#8A8A8A]">
        Works in MCP Inspector and other clients that support Streamable HTTP.
      </p>
    </div>
  );
}
