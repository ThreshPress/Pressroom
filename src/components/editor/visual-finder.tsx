import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateVisual, searchOpenverse } from "@/lib/pressroom/ai";
import { STOCK } from "@/lib/pressroom/elements-library";
import type { CanvasElement, Page, VisualHit } from "@/lib/pressroom/types";
import { uid, cn } from "@/lib/utils";

function queriesFromPage(page?: Page): string[] {
  if (!page) return ["classroom", "public school", "receipt"];
  const text = page.elements
    .map((el) => {
      if (el.type === "text") return el.text;
      if (el.type === "image") return el.query ?? el.alt;
      return "";
    })
    .join(" ");
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const uniq = [...new Set(words)].slice(0, 6);
  return uniq.length ? uniq : ["documentary photograph"];
}

export function VisualFinder({
  open,
  onOpenChange,
  page,
  onInsert,
  onReplace,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  page?: Page;
  onInsert: (el: CanvasElement) => void;
  onReplace: (src: string, alt: string, credit?: string) => void;
}) {
  const suggested = useMemo(() => queriesFromPage(page), [page]);
  const [tab, setTab] = useState<"suggested" | "photos" | "generate" | "library">("suggested");
  const [q, setQ] = useState(suggested[0] ?? "");
  const [hits, setHits] = useState<VisualHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");

  async function search(query: string) {
    setBusy(true);
    const result = await searchOpenverse({ data: { query } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setHits(result.hits);
    setTab("photos");
  }

  async function generate() {
    if (!genPrompt.trim()) return;
    setBusy(true);
    const result = await generateVisual({ data: { prompt: genPrompt.trim() } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setHits([result.hit, ...hits]);
    setTab("photos");
  }

  function place(hit: VisualHit, replace = false) {
    if (replace) onReplace(hit.src, hit.alt, hit.credit);
    else
      onInsert({
        id: uid("el"),
        type: "image",
        x: 80,
        y: 120,
        w: 640,
        h: 360,
        z: 40,
        src: hit.src,
        alt: hit.alt,
        fit: "cover",
        credit: hit.credit,
        query: hit.query,
      });
    onOpenChange(false);
  }

  const tabs = [
    ["suggested", "Suggested"],
    ["photos", "Photos"],
    ["generate", "Generate"],
    ["library", "Library"],
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Visual Finder</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 px-6">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                tab === id ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6 pt-4">
          {tab === "suggested" && (
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => { setQ(s); void search(s); }}>
                  {s}
                </Button>
              ))}
            </div>
          )}
          {tab === "photos" && (
            <>
              <form
                className="mb-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void search(q);
                }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search licensed photos" />
                </div>
                <Button type="submit" disabled={busy}>
                  Search
                </Button>
              </form>
              {busy && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Searching
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {hits.map((h) => (
                  <figure key={h.id} className="overflow-hidden rounded-md border border-border">
                    <img src={h.thumb ?? h.src} alt={h.alt} className="h-32 w-full object-cover" />
                    <figcaption className="flex items-center justify-between gap-1 px-2 py-1 text-[10px] text-muted-foreground">
                      <span className="truncate">{h.credit ?? h.license ?? "Openverse"}</span>
                      <span className="flex gap-1">
                        <button className="underline" onClick={() => place(h, false)}>
                          Insert
                        </button>
                        <button className="underline" onClick={() => place(h, true)}>
                          Replace
                        </button>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
          {tab === "generate" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate a custom educational photograph. Avoid requesting images of minors.
              </p>
              <Input
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="A documentary photo of a fire station exterior, no people"
              />
              <Button onClick={() => void generate()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Generate
              </Button>
            </div>
          )}
          {tab === "library" && (
            <div className="grid grid-cols-2 gap-2">
              {STOCK.map((s) => (
                <button
                  key={s.id}
                  className="overflow-hidden rounded-md border border-border"
                  onClick={() =>
                    place({ id: s.id, src: s.src, alt: s.alt, query: s.query }, false)
                  }
                >
                  <img src={s.src} alt={s.alt} className="h-28 w-full object-cover" />
                  <div className="px-2 py-1 text-left text-[11px] text-muted-foreground">{s.alt}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
