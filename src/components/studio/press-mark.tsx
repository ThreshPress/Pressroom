import { cn } from "@/lib/utils";

/** Letterpress sort — ink plate with a metal P. */
export function PressMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0 text-ink", className)}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" fill="currentColor" />
      <rect x="3.5" y="3.5" width="25" height="25" className="stroke-paper" fill="none" strokeWidth="0.75" />
      <path
        className="fill-paper"
        d="M9.2 7.6h8.05c3.55 0 5.55 1.95 5.55 4.85 0 2.95-2.05 4.9-5.65 4.9H13.1v7.05H9.2V7.6zm3.9 2.45v4.85h3.95c1.85 0 2.9-.9 2.9-2.4s-1.05-2.45-2.95-2.45H13.1z"
      />
    </svg>
  );
}
