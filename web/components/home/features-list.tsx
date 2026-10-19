import { CalendarDays, Radio, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    Icon: CalendarDays,
    title: "Google Calendar",
    text: "Read, create, update and delete events in your connected account.",
  },
  {
    Icon: Radio,
    title: "One endpoint",
    text: "Every tool is served from the same URL.",
  },
  {
    Icon: ShieldCheck,
    title: "Personal account access",
    text: "Secure remote OAuth with PKCE and short-lived access tokens.",
  },
];

export default function FeaturesList() {
  return (
    <ul
      className="rise mt-10 divide-y divide-white/10 border-y border-white/10"
      style={{ animationDelay: "440ms" }}
    >
      {FEATURES.map(({ Icon, title, text }) => (
        <li key={title} className="flex items-start gap-4 py-4">
          <Icon
            size={20}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0 text-[#F5C518]"
          />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-[#8A8A8A]">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
