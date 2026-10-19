
import { Bot, Plug, CalendarDays } from "lucide-react";

export default function Diagram() {
    return (
        <div className="mx-auto w-full max-w-md">
            <svg
                viewBox="0 0 480 130"
                className="h-auto w-full"
                role="img"
                aria-label="Assistant connects through MCP server to Google Calendar"
            >
                {/* Cables */}
                <g stroke="#2B2B2B" strokeWidth="2">
                    <line x1="82" y1="55" x2="198" y2="55" />
                    <line x1="282" y1="55" x2="398" y2="55" />
                </g>

                <g
                    stroke="#F5C518"
                    strokeWidth="2"
                    className="flow"
                    opacity="0.8"
                >
                    <line x1="82" y1="55" x2="198" y2="55" />
                    <line x1="282" y1="55" x2="398" y2="55" />
                </g>

                {/* Data packets */}
                <circle r="4" fill="#fff" className="motion-dot">
                    <animateMotion
                        dur="1.8s"
                        repeatCount="indefinite"
                        path="M82 55 H198"
                    />
                </circle>

                <circle r="4" fill="#fff" className="motion-dot">
                    <animateMotion
                        dur="1.8s"
                        begin="0.9s"
                        repeatCount="indefinite"
                        path="M282 55 H398"
                    />
                </circle>

                {/* Assistant */}
                <circle
                    cx="50" cy="55" r="32"
                    fill="#000" stroke="#333" strokeWidth="1.5"
                />
                <Bot x={36} y={41} size={28} color="#fff" strokeWidth={1.8} />

                {/* MCP Server */}
                <circle
                    cx="240" cy="55" r="38"
                    fill="none" stroke="#F5C518" strokeWidth="1.5"
                    className="motion-dot"
                >
                    <animate
                        attributeName="r"
                        values="38;58"
                        dur="2.4s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.7;0"
                        dur="2.4s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle cx="240" cy="55" r="38" fill="#F5C518" />
                <Plug x={224} y={39} size={32} color="#000" strokeWidth={2.2} />

                {/* Calendar */}
                <circle
                    cx="430" cy="55" r="32"
                    fill="#000" stroke="#333" strokeWidth="1.5"
                />
                <CalendarDays
                    x={416} y={41}
                    size={28}
                    color="#fff"
                    strokeWidth={1.8}
                />

                {/* Labels */}
                <g fill="#8A8A8A" fontSize="14" textAnchor="middle">
                    <text x="50" y="112">Assistant</text>
                    <text x="240" y="112">MCP server</text>
                    <text x="430" y="112">Calendar</text>
                </g>
            </svg>
        </div>
    );
}
