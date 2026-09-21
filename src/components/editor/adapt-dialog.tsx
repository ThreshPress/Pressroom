import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUPPORTS = [
  "Chunk directions",
  "Reduce choices",
  "Visual supports",
  "Word banks",
  "Examples",
  "Sentence starters",
  "Reduced written response",
  "Read-aloud friendly",
];

export function AdaptDialog({
  open,
  onOpenChange,
  onAdapt,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdapt: (opts: {
    reading: "original" | "accessible" | "simplified";
    supports: string[];
    copy: boolean;
  }) => Promise<void> | void;
}) {
  const [reading, setReading] = useState<"original" | "accessible" | "simplified">("accessible");
  const [supports, setSupports] = useState<string[]>(["Chunk directions", "Word banks"]);
  const [copy, setCopy] = useState(true);
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adapt</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 px-6 py-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reading</p>
            <div className="flex gap-1">
              {(["original", "accessible", "simplified"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setReading(r)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-2 text-xs capitalize",
                    reading === r ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Supports</p>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTS.map((s) => {
                const on = supports.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => setSupports(on ? supports.filter((x) => x !== s) : [...supports, s])}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      on ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCopy(false)}
              className={cn("flex-1 rounded-md px-2 py-2 text-xs", !copy ? "bg-ink text-paper" : "bg-muted")}
            >
              Modify current
            </button>
            <button
              onClick={() => setCopy(true)}
              className={cn("flex-1 rounded-md px-2 py-2 text-xs", copy ? "bg-ink text-paper" : "bg-muted")}
            >
              Create adapted copy
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              setBusy(true);
              await onAdapt({ reading, supports, copy });
              setBusy(false);
            }}
            disabled={busy}
          >
            Adapt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
