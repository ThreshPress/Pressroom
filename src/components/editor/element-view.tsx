import type { CSSProperties } from "react";
import {
  ArrowDown,
  ArrowRight,
  Atom,
  Banknote,
  BarChart3,
  BookOpen,
  Calculator,
  ChartLine,
  ClipboardList,
  Coins,
  Flag,
  FlaskConical,
  GitBranch,
  Hash,
  Landmark,
  Leaf,
  Map,
  Pencil,
  Percent,
  PieChart,
  Receipt,
  Repeat,
  Scale,
  School,
  Sigma,
  Square,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CanvasElement, QuestionElement, ShapeKind } from "@/lib/pressroom/types";
import { C } from "@/lib/pressroom/palette";
import { cn } from "@/lib/utils";

const FONT: Record<string, string> = {
  display: "var(--font-display)",
  serif: "var(--font-display)",
  sans: "var(--font-sans)",
};

function shapePath(kind: ShapeKind, w: number, h: number): string | null {
  if (kind === "triangle") return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
  if (kind === "diamond") return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
  if (kind === "hexagon") {
    const x = w * 0.25;
    return `M ${x} 0 L ${w - x} 0 L ${w} ${h / 2} L ${w - x} ${h} L ${x} ${h} L 0 ${h / 2} Z`;
  }
  if (kind === "arrow-right") {
    return `M 0 ${h * 0.28} H ${w * 0.62} V 0 L ${w} ${h / 2} L ${w * 0.62} ${h} V ${h * 0.72} H 0 Z`;
  }
  if (kind === "chevron") {
    return `M 0 0 L ${w * 0.72} 0 L ${w} ${h / 2} L ${w * 0.72} ${h} L 0 ${h} L ${w * 0.28} ${h / 2} Z`;
  }
  return null;
}

function Shape({ el }: { el: Extract<CanvasElement, { type: "shape" }> }) {
  const r = el.radius ?? (el.shape === "round-rect" ? 10 : 0);
  if (el.shape === "ellipse") {
    return (
      <div
        className="h-full w-full"
        style={{
          background: el.fill,
          border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
          borderRadius: "999px",
        }}
      />
    );
  }
  const d = shapePath(el.shape, el.w, el.h);
  if (d) {
    return (
      <svg viewBox={`0 0 ${el.w} ${el.h}`} className="h-full w-full" aria-hidden>
        <path d={d} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
      </svg>
    );
  }
  if (el.shape === "speech") {
    return (
      <svg viewBox={`0 0 ${el.w} ${el.h}`} className="h-full w-full" aria-hidden>
        <rect x="0" y="0" width={el.w} height={el.h * 0.78} rx="10" fill={el.fill} />
        <path d={`M ${el.w * 0.18} ${el.h * 0.78} L ${el.w * 0.18} ${el.h} L ${el.w * 0.32} ${el.h * 0.78}`} fill={el.fill} />
      </svg>
    );
  }
  if (el.shape === "banner") {
    return (
      <svg viewBox={`0 0 ${el.w} ${el.h}`} className="h-full w-full" aria-hidden>
        <path d={`M 0 0 H ${el.w} L ${el.w * 0.92} ${el.h / 2} L ${el.w} ${el.h} H 0 L ${el.w * 0.08} ${el.h / 2} Z`} fill={el.fill} />
      </svg>
    );
  }
  return (
    <div
      className="h-full w-full"
      style={{
        background: el.fill,
        border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
        borderRadius: r,
      }}
    />
  );
}

function QuestionBlock({ el }: { el: QuestionElement }) {
  const item = el.item;
  return (
    <div className="h-full overflow-hidden px-1" style={{ color: C.ink }}>
      <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{item.prompt}</div>
      <div className="mt-2 flex flex-col gap-1">
        {(item.choices ?? []).map((c) => (
          <div key={c.id} className="flex items-start gap-2" style={{ fontSize: 13, color: C.inkSoft }}>
            <span
              className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border"
              style={{ borderColor: C.rule, fontSize: 9 }}
            >
              {el.showKey && item.correct === c.id ? "●" : ""}
            </span>
            <span>
              <strong className="mr-1">{c.id}.</strong>
              {c.text}
            </span>
          </div>
        ))}
        {(item.kind === "short" || item.kind === "fill") && (
          <div className="mt-2 h-8 border-b" style={{ borderColor: C.rule }} />
        )}
      </div>
    </div>
  );
}

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  School,
  Pencil,
  ClipboardList,
  Percent,
  Calculator,
  Sigma,
  Hash,
  FlaskConical,
  Atom,
  Leaf,
  Landmark,
  Scale,
  Flag,
  Map,
  Banknote,
  Coins,
  Receipt,
  Wallet,
  ArrowRight,
  ArrowDown,
  Repeat,
  GitBranch,
  BarChart3,
  PieChart,
  ChartLine,
  Square,
};

export function ElementView({
  el,
  editing,
  onChangeText,
}: {
  el: CanvasElement;
  editing?: boolean;
  onChangeText?: (text: string) => void;
}) {
  if (el.hidden) return null;

  if (el.type === "text") {
    const style: CSSProperties = {
      fontFamily: FONT[el.font],
      fontSize: el.fontSize,
      fontWeight: el.fontWeight,
      lineHeight: el.lineHeight,
      letterSpacing: el.letterSpacing,
      color: el.color,
      textAlign: el.align,
      fontStyle: el.italic ? "italic" : "normal",
      textDecoration: el.underline ? "underline" : "none",
      textTransform: el.uppercase ? "uppercase" : "none",
      whiteSpace: "pre-wrap",
      overflow: "hidden",
      width: "100%",
      height: "100%",
    };
    if (editing) {
      return (
        <textarea
          autoFocus
          className="h-full w-full resize-none bg-transparent outline-none"
          style={style}
          defaultValue={el.text}
          onBlur={(e) => onChangeText?.(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        />
      );
    }
    return <div style={style}>{el.text}</div>;
  }

  if (el.type === "shape") return <Shape el={el} />;
  if (el.type === "image") {
    if (!el.src) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
          {el.query ?? "Image"}
        </div>
      );
    }
    return (
      <img
        src={el.src}
        alt={el.alt}
        draggable={false}
        className={cn("h-full w-full", el.fit === "contain" ? "object-contain" : "object-cover")}
        style={{
          transform: `${el.flipX ? "scaleX(-1)" : ""} ${el.flipY ? "scaleY(-1)" : ""}`.trim() || undefined,
          filter: `brightness(${el.brightness ?? 1}) contrast(${el.contrast ?? 1})`,
        }}
      />
    );
  }
  if (el.type === "line") {
    return (
      <div
        className="h-full w-full"
        style={{
          borderTop: `${el.strokeWidth}px ${el.dashed ? "dashed" : "solid"} ${el.stroke}`,
        }}
      />
    );
  }
  if (el.type === "divider") {
    return <div className="h-full w-full" style={{ background: el.color, height: el.weight }} />;
  }
  if (el.type === "icon") {
    const Icon = ICONS[el.icon] ?? Square;
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Icon className="h-[80%] w-[80%]" color={el.color} strokeWidth={1.6} />
      </div>
    );
  }
  if (el.type === "table") {
    return (
      <table className="h-full w-full border-collapse text-left" style={{ fontSize: 12, color: el.cellColor }}>
        <thead>
          <tr>
            {el.columns.map((c) => (
              <th
                key={c}
                className="border px-2 py-1 font-semibold"
                style={{ background: el.headerFill, color: el.headerColor, borderColor: el.border }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {el.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border px-2 py-1 align-top" style={{ borderColor: el.border }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (el.type === "question") return <QuestionBlock el={el} />;
  if (el.type === "callout") {
    const accent = el.variant === "example" ? C.slate : el.variant === "warn" ? C.rust : C.ink;
    return (
      <div className="h-full overflow-hidden px-4 py-3" style={{ background: C.cream, borderLeft: `4px solid ${accent}` }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: accent,
            marginBottom: 6,
          }}
        >
          {el.kicker}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: C.inkSoft, whiteSpace: "pre-wrap" }}>{el.body}</div>
      </div>
    );
  }
  return null;
}
