import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How it works", href: "/docs" },
];

export default function SiteFooter() {
  return (
    <footer className="rise mt-10 border-t-2 border-[#2B2B2B] pt-5" style={{ animationDelay: "520ms" }}>
      <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F5C518]">Links</p>
          <nav aria-label="Footer navigation" className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="text-sm text-[#A5A5A5] transition-colors hover:text-[#F5C518]">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F5C518]">Created by</p>
          <a
            href="https://tarikul-islam.me/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#EDEDED] transition-colors hover:text-[#F5C518]"
          >
            Tarikul Islam <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      <p className="mt-6 border-t border-[#222] pt-4 text-xs text-[#777]">
        Built with Next.js and the Model Context Protocol.
      </p>
    </footer>
  );
}
