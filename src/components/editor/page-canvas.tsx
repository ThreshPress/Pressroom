import { useRef, useState } from "react";
import type { CanvasElement, Page } from "@/lib/pressroom/types";
import { PAGE_SIZES } from "@/lib/pressroom/types";
import { cn } from "@/lib/utils";
import { ElementView } from "./element-view";

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];

export function PageCanvas({
  page,
  selectedIds,
  zoom,
  interactive,
  onSelect,
  onChange,
  onEditingId,
}: {
  page: Page;
  selectedIds: string[];
  zoom: number;
  interactive?: boolean;
  onSelect?: (ids: string[], additive?: boolean) => void;
  onChange?: (id: string, patch: Partial<CanvasElement>) => void;
  onEditingId?: (id: string | null) => void;
}) {
  const size = PAGE_SIZES[page.size];
  const root = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const drag = useRef<{
    ids: string[];
    startX: number;
    startY: number;
    orig: Record<string, { x: number; y: number; w: number; h: number }>;
    handle?: Handle;
  } | null>(null);

  const sorted = [...page.elements].sort((a, b) => a.z - b.z);

  function clientToPage(e: { clientX: number; clientY: number }) {
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  }

  function onPointerDownEl(e: React.PointerEvent, el: CanvasElement) {
    if (!interactive || el.locked) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const additive = e.shiftKey;
    const ids = additive && selectedIds.includes(el.id) ? selectedIds : additive ? [...selectedIds, el.id] : [el.id];
    onSelect?.(ids, additive);
    const orig: Record<string, { x: number; y: number; w: number; h: number }> = {};
    for (const id of ids) {
      const t = page.elements.find((x) => x.id === id);
      if (t) orig[id] = { x: t.x, y: t.y, w: t.w, h: t.h };
    }
    const p = clientToPage(e);
    drag.current = { ids, startX: p.x, startY: p.y, orig };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !interactive) return;
    const p = clientToPage(e);
    const dx = p.x - drag.current.startX;
    const dy = p.y - drag.current.startY;
    const handle = drag.current.handle;
    for (const id of drag.current.ids) {
      const o = drag.current.orig[id];
      if (!o) continue;
      if (!handle) {
        onChange?.(id, { x: Math.round(o.x + dx), y: Math.round(o.y + dy) });
      } else {
        let { x, y, w, h } = o;
        if (handle.includes("e")) w = Math.max(24, o.w + dx);
        if (handle.includes("s")) h = Math.max(16, o.h + dy);
        if (handle.includes("w")) {
          w = Math.max(24, o.w - dx);
          x = o.x + dx;
        }
        if (handle.includes("n")) {
          h = Math.max(16, o.h - dy);
          y = o.y + dy;
        }
        onChange?.(id, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
      }
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  function startHandle(e: React.PointerEvent, handle: Handle, el: CanvasElement) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = clientToPage(e);
    drag.current = {
      ids: [el.id],
      startX: p.x,
      startY: p.y,
      orig: { [el.id]: { x: el.x, y: el.y, w: el.w, h: el.h } },
      handle,
    };
  }

  return (
    <div
      style={{
        width: size.w * zoom,
        height: size.h * zoom,
        overflow: "hidden",
      }}
    >
      <div
        ref={root}
        className="relative shadow-[var(--shadow-border)]"
        style={{
          width: size.w,
          height: size.h,
          background: page.background,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerDown={() => {
          if (!interactive) return;
          onSelect?.([]);
          setEditingId(null);
          onEditingId?.(null);
        }}
      >
      {sorted.map((el) => {
        const selected = selectedIds.includes(el.id);
        return (
          <div
            key={el.id}
            className={cn(
              "absolute",
              interactive && "cursor-move",
              selected && interactive && "ring-2 ring-steel/80",
            )}
            style={{
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              opacity: el.opacity ?? 1,
              zIndex: el.z,
            }}
            onPointerDown={(e) => onPointerDownEl(e, el)}
            onDoubleClick={(e) => {
              if (el.type !== "text" || !interactive) return;
              e.stopPropagation();
              setEditingId(el.id);
              onEditingId?.(el.id);
            }}
          >
            <ElementView
              el={el}
              editing={editingId === el.id}
              onChangeText={(text) => {
                onChange?.(el.id, { text } as Partial<CanvasElement>);
                setEditingId(null);
                onEditingId?.(null);
              }}
            />
            {selected && interactive && !el.locked &&
              HANDLES.map((h) => (
                <button
                  key={h}
                  aria-label={`Resize ${h}`}
                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-card ring-1 ring-steel"
                  style={{
                    left: h.includes("w") ? 0 : h.includes("e") ? "100%" : "50%",
                    top: h.includes("n") ? 0 : h.includes("s") ? "100%" : "50%",
                    cursor: `${h}-resize`,
                  }}
                  onPointerDown={(e) => startHandle(e, h, el)}
                />
              ))}
          </div>
        );
      })}
      </div>
    </div>
  );
}
