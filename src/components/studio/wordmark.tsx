import { cn } from "@/lib/utils";
import { PressMark } from "./press-mark";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <PressMark className="size-[22px] text-ink" />
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
