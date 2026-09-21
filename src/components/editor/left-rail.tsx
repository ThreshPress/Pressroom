import { FileStack, Shapes, Image as ImageIcon, BookOpen, Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LIBRARY, COLLECTIONS, STOCK } from "@/lib/pressroom/elements-library";
import type { Artifact, Blueprint, CanvasElement, Page } from "@/lib/pressroom/types";
import { C } from "@/lib/pressroom/palette";
import { uid, cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export function LeftRail({
  tab,
  onTab,
  artifact,
  selectedPageId,
  onSelectPage,
  onAddPage,
  blueprint,
  onInsert,
}: {
  tab: "pages" | "elements" | "visuals" | "blueprint";
  onTab: (t: "pages" | "elements" | "visuals" | "blueprint") => void;
  artifact?: Artifact;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  blueprint: Blueprint | null;
  onInsert: (el: CanvasElement) => void;
}) {
  const tabs = [
    { id: "pages" as const, icon: FileStack, label: "Pages" },
    { id: "elements" as const, icon: Shapes, label: "Elements" },
    { id: "visuals" as const, icon: ImageIcon, label: "Visuals" },
    { id: "blueprint" as const, icon: BookOpen, label: "Blueprint" },
  ];

  return (
    <aside className="flex h-full w-[17.5rem] shrink-0 flex-col border-r border-border bg-card">
      <div className="grid grid-cols-4 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider",
              tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        {tab === "pages" && artifact && (
          <PagesList
            artifact={artifact}
            selectedPageId={selectedPageId}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
          />
        )}
        {tab === "elements" && <ElementsList onInsert={onInsert} />}
        {tab === "visuals" && <VisualsList onInsert={onInsert} />}
        {tab === "blueprint" && <BlueprintPanel blueprint={blueprint} />}
      </ScrollArea>
    </aside>
  );
}

function PagesList({
  artifact,
  selectedPageId,
  onSelectPage,
  onAddPage,
}: {
  artifact: Artifact;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-3">
      {artifact.pages.map((page, i) => (
        <button
          key={page.id}
          onClick={() => onSelectPage(page.id)}
          className={cn(
            "overflow-hidden rounded-md border text-left",
            selectedPageId === page.id ? "border-ink" : "border-border",
          )}
        >
          <div
            className="relative overflow-hidden bg-muted"
            style={{ height: 88 }}
          >
            <MiniPage page={page} />
          </div>
          <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
            {String(i + 1).padStart(2, "0")}  {page.name}
          </div>
        </button>
      ))}
      <Button variant="outline" size="sm" onClick={onAddPage}>
        <Plus className="size-3.5" /> Add page
      </Button>
    </div>
  );
}

function MiniPage({ page }: { page: Page }) {
  const texts = page.elements.filter((el) => el.type === "text").slice(0, 4);
  const image = page.elements.find((el) => el.type === "image");
  return (
    <div className="flex h-full gap-2 px-2 py-1.5" style={{ background: page.background }}>
      <div className="min-w-0 flex-1">
        {texts.map((el) => {
          if (el.type !== "text") return null;
          return (
            <div
              key={el.id}
              className="truncate leading-tight"
              style={{
                color: el.color,
                fontWeight: el.fontWeight >= 600 ? 600 : 400,
                fontSize: el.fontSize > 40 ? 12 : 10,
                fontFamily: el.font === "display" ? "var(--font-display)" : undefined,
              }}
            >
              {el.text}
            </div>
          );
        })}
      </div>
      {image && image.type === "image" && image.src ? (
        <img src={image.src} alt="" className="h-full w-16 shrink-0 object-cover" />
      ) : null}
    </div>
  );
}

function ElementsList({ onInsert }: { onInsert: (el: CanvasElement) => void }) {
  const [q, setQ] = useState("");
  const [col, setCol] = useState<string>("All");
  const items = useMemo(() => {
    return LIBRARY.filter((i) => {
      if (col !== "All" && i.collection !== col) return false;
      if (q && !`${i.label} ${i.collection}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, col]);

  return (
    <div className="p-3">
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input className="h-9 pl-8" placeholder="Search elements" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {["All", ...COLLECTIONS].map((c) => (
          <button
            key={c}
            onClick={() => setCol(c)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              col === c ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            className="rounded-md border border-border bg-background px-2 py-3 text-left text-xs hover:bg-muted"
            onClick={() => {
              if (item.kind === "shape") {
                onInsert({
                  id: uid("el"),
                  type: "shape",
                  x: 120,
                  y: 120,
                  w: 220,
                  h: 140,
                  z: 50,
                  shape: (item.shape ?? "rect") as Extract<CanvasElement, { type: "shape" }>["shape"],
                  fill: C.cream,
                  stroke: C.ink,
                  strokeWidth: 0,
                } as CanvasElement);
              } else if (item.kind === "icon") {
                onInsert({
                  id: uid("el"),
                  type: "icon",
                  x: 120,
                  y: 120,
                  w: 72,
                  h: 72,
                  z: 50,
                  icon: item.icon ?? "Square",
                  color: C.ink,
                });
              } else {
                onInsert({
                  id: uid("el"),
                  type: "text",
                  x: 120,
                  y: 120,
                  w: 400,
                  h: 80,
                  z: 50,
                  text: item.sample ?? "Text",
                  font: "sans",
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: C.ink,
                  align: "left",
                });
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function VisualsList({ onInsert }: { onInsert: (el: CanvasElement) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Library</p>
      {STOCK.map((s) => (
        <button
          key={s.id}
          className="overflow-hidden rounded-md border border-border text-left"
          onClick={() =>
            onInsert({
              id: uid("el"),
              type: "image",
              x: 80,
              y: 80,
              w: 640,
              h: 360,
              z: 40,
              src: s.src,
              alt: s.alt,
              fit: "cover",
              query: s.query,
            })
          }
        >
          <img src={s.src} alt={s.alt} className="h-28 w-full object-cover" />
          <div className="px-2 py-1 text-[11px] text-muted-foreground">{s.alt}</div>
        </button>
      ))}
    </div>
  );
}

function BlueprintPanel({ blueprint }: { blueprint: Blueprint | null }) {
  if (!blueprint) {
    return <p className="p-4 text-sm text-muted-foreground">Develop a blueprint to ground every pressing in the same instructional source.</p>;
  }
  return (
    <div className="space-y-4 p-4 text-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-rust">Topic</p>
        <p className="font-display text-lg font-semibold">{blueprint.topic}</p>
        <p className="text-muted-foreground">{blueprint.audience}</p>
      </div>
      {blueprint.drivingQuestion && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Driving question</p>
          <p>{blueprint.drivingQuestion}</p>
        </div>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Objectives</p>
        <ol className="list-decimal space-y-1 pl-4">
          {blueprint.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vocabulary</p>
        <ul className="space-y-1">
          {blueprint.vocabulary.map((v) => (
            <li key={v.term}>
              <strong>{v.term}.</strong> {v.definition}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Misconceptions</p>
        <ul className="space-y-2">
          {blueprint.misconceptions.map((m) => (
            <li key={m.myth}>
              <span className="text-rust">Not: </span>
              {m.myth}
              <div className="text-muted-foreground">{m.repair}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
