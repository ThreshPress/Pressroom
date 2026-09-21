import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CATEGORIES, FORMATS, recommendFormats } from "@/lib/pressroom/formats";
import type { FormatId } from "@/lib/pressroom/types";
import { cn } from "@/lib/utils";

export function PressDialog({
  open,
  onOpenChange,
  title,
  topic,
  objectives,
  existing,
  busy,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  topic?: string;
  objectives?: string[];
  existing?: FormatId[];
  busy?: FormatId | null;
  onChoose: (id: FormatId) => void;
}) {
  const rec = recommendFormats(topic ?? "", objectives ?? []);
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["id"] | "all">("all");
  const list = FORMATS.filter((f) => cat === "all" || f.category === cat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            One blueprint. Many pressings. The writing and layout change to fit the medium.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 overflow-x-auto px-6">
          <button
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              cat === "all" ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
            )}
            onClick={() => setCat("all")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                cat === c.id ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
              )}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 overflow-y-auto px-6 py-4 sm:grid-cols-2">
          {list.map((f) => {
            const recommended = rec.includes(f.id);
            const already = existing?.includes(f.id);
            return (
              <button
                key={f.id}
                disabled={busy != null}
                onClick={() => onChoose(f.id)}
                className="rounded-lg border border-border bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[transform,background-color] duration-150 hover:bg-muted/60 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{f.label}</div>
                  {busy === f.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : recommended ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-rust">Suggested</span>
                  ) : already ? (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">In project</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{f.blurb}</p>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-6">
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
