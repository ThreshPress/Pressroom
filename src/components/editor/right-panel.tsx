import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SWATCHES } from "@/lib/pressroom/palette";
import type { CanvasElement, ImageElement, TextElement } from "@/lib/pressroom/types";
import { cn } from "@/lib/utils";

export function RightPanel({
  tab,
  onTab,
  selected,
  onChange,
  onAsk,
  asking,
  messages,
  onLayer,
}: {
  tab: "properties" | "ask";
  onTab: (t: "properties" | "ask") => void;
  selected?: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onAsk: (text: string) => void;
  asking: boolean;
  messages: { role: "user" | "assistant"; text: string }[];
  onLayer: (dir: "front" | "back" | "forward" | "backward") => void;
}) {
  return (
    <aside className="flex h-full w-[20rem] shrink-0 flex-col border-l border-border bg-card">
      <div className="grid grid-cols-2 border-b border-border">
        {(["properties", "ask"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTab(t)}
            className={cn(
              "py-3 text-[11px] font-semibold uppercase tracking-wider",
              tab === t ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {t === "properties" ? "Properties" : "Ask Pressroom"}
          </button>
        ))}
      </div>
      {tab === "properties" ? (
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {!selected && <p className="text-sm text-muted-foreground">Select an object to inspect it.</p>}
            {selected && <PropsForm el={selected} onChange={onChange} onLayer={onLayer} />}
          </div>
        </ScrollArea>
      ) : (
        <AskPane messages={messages} asking={asking} onAsk={onAsk} />
      )}
    </aside>
  );
}

function PropsForm({
  el,
  onChange,
  onLayer,
}: {
  el: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onLayer: (dir: "front" | "back" | "forward" | "backward") => void;
}) {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{el.type}</p>
      <div className="grid grid-cols-2 gap-2">
        {(["x", "y", "w", "h"] as const).map((k) => (
          <label key={k} className="text-[11px] text-muted-foreground">
            {k.toUpperCase()}
            <Input
              className="mt-1 h-8"
              type="number"
              value={Math.round(el[k])}
              onChange={(e) => onChange({ [k]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {(["forward", "backward", "front", "back"] as const).map((d) => (
          <Button key={d} size="sm" variant="outline" onClick={() => onLayer(d)}>
            {d}
          </Button>
        ))}
      </div>
      {el.type === "text" && <TextProps el={el} onChange={onChange} />}
      {el.type === "shape" && (
        <div>
          <Label>Fill</Label>
          <Swatches value={el.fill} onChange={(fill) => onChange({ fill })} />
        </div>
      )}
      {el.type === "image" && <ImageProps el={el} onChange={onChange} />}
      {el.type === "icon" && (
        <div>
          <Label>Color</Label>
          <Swatches value={el.color} onChange={(color) => onChange({ color })} />
        </div>
      )}
    </>
  );
}

function TextProps({ el, onChange }: { el: TextElement; onChange: (p: Partial<CanvasElement>) => void }) {
  return (
    <>
      <div>
        <Label>Text</Label>
        <Textarea className="mt-1" value={el.text} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
      <div>
        <Label>Size {el.fontSize}</Label>
        <Slider
          className="mt-2"
          min={10}
          max={120}
          value={[el.fontSize]}
          onValueChange={([v]) => onChange({ fontSize: v })}
        />
      </div>
      <div className="flex gap-1">
        {(["left", "center", "right"] as const).map((a) => (
          <Button key={a} size="sm" variant={el.align === a ? "default" : "outline"} onClick={() => onChange({ align: a })}>
            {a}
          </Button>
        ))}
      </div>
      <div>
        <Label>Color</Label>
        <Swatches value={el.color} onChange={(color) => onChange({ color })} />
      </div>
    </>
  );
}

function ImageProps({ el, onChange }: { el: ImageElement; onChange: (p: Partial<CanvasElement>) => void }) {
  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => onChange({ flipX: !el.flipX })}>
          Flip H
        </Button>
        <Button size="sm" variant="outline" onClick={() => onChange({ flipY: !el.flipY })}>
          Flip V
        </Button>
        <Button size="sm" variant="outline" onClick={() => onChange({ fit: el.fit === "cover" ? "contain" : "cover" })}>
          {el.fit}
        </Button>
      </div>
      <div>
        <Label>Alt text</Label>
        <Input className="mt-1 h-8" value={el.alt} onChange={(e) => onChange({ alt: e.target.value })} />
      </div>
      {el.credit && <p className="text-xs text-muted-foreground">{el.credit}</p>}
    </>
  );
}

function Swatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {SWATCHES.map((c) => (
        <button
          key={c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn("size-6 rounded-sm border", value === c ? "border-ink" : "border-border")}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function AskPane({
  messages,
  asking,
  onAsk,
}: {
  messages: { role: "user" | "assistant"; text: string }[];
  asking: boolean;
  onAsk: (t: string) => void;
}) {
  const [text, setText] = useState("");
  const chips = [
    "Make this less crowded",
    "Shorten the text",
    "Add a real-world example",
    "Change questions to two choices",
    "Create an answer key",
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask Pressroom to modify this artifact. It will change the document, not just tell you how.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("rounded-lg px-3 py-2 text-sm", m.role === "user" ? "bg-muted" : "bg-background border border-border")}
            >
              {m.text}
            </div>
          ))}
          {asking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Setting type…
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {chips.map((c) => (
            <button
              key={c}
              className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => onAsk(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <form
          className="flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            onAsk(text.trim());
            setText("");
          }}
        >
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Make this more visual…" />
          <Button type="submit" size="icon" disabled={asking}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
