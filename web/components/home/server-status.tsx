export default function ServerStatus() {
  return (
    <span style={{ animationDelay: "80ms" }} className="rise mb-5 inline-flex items-center gap-2 text-sm text-[#8A8A8A]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F5C518] opacity-60" />
        <span className="relative h-2 w-2 rounded-full bg-[#F5C518]" />
      </span>
      Online
    </span>
  );
}
