import { cn } from "@/lib/utils";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="shrink-0">
        <rect x="1" y="1" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 6.5h4.2c2.2 0 3.6 1.2 3.6 3.1 0 1.9-1.4 3.1-3.6 3.1H8V6.5Zm0 8.2h8.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19.2" cy="4.8" r="0.8" fill="currentColor" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-[17px] font-semibold tracking-tight">Pressroom</div>
        {!compact && (
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            by ThreshPress
          </div>
        )}
      </div>
    </div>
  );
}
