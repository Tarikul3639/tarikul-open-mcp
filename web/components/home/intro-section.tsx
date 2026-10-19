import EndpointConnect from "@/components/home/endpoint-connect";
import ServerStatus from "@/components/home/server-status";

export default function IntroSection() {
  return (
    <section className="pt-12 sm:pt-16">
      <ServerStatus />
      <h1
        className="rise text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"
        style={{ animationDelay: "80ms" }}
      >
        Your calendar, connected on your terms.
      </h1>
      <p
        className="rise mt-4 max-w-md text-base leading-relaxed text-[#8A8A8A]"
        style={{ animationDelay: "160ms" }}
      >
        Connect Google Calendar to a remote MCP client. Sign in with your Google
        account, then manage your connection from one dashboard.
      </p>
      <EndpointConnect />
    </section>
  );
}
