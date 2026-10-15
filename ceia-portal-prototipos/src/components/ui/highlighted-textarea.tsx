import * as React from "react";
import { cn } from "@/lib/utils";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightPlaceholders(text: string, cls = "px-1 rounded bg-amber-100 text-amber-800") {
  if (!text) return "";
  const escaped = escapeHtml(text);
  return escaped.replace(/\[([^\]]+)\]/g, (m) => `<span class=\"${cls}\">${m}</span>`);
}

export default function HighlightedTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
  highlightClass,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  highlightClass?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words rounded-md p-2.5 text-sm leading-relaxed text-foreground"
        style={{ whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: highlightPlaceholders(value || "", highlightClass) }}
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border bg-transparent p-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y relative"
        style={{ color: "transparent", caretColor: "var(--foreground)" }}
      />
    </div>
  );
}
