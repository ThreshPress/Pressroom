import { uid } from "@/lib/utils";
import { C } from "./palette";
import { formatMeta } from "./formats";
import type {
  Artifact,
  AssessmentItem,
  ArticleDoc,
  CalloutElement,
  CanvasElement,
  FormatId,
  ImageElement,
  InfographicDoc,
  LessonPlanDoc,
  OrganizerDoc,
  Page,
  PageSizeId,
  PresentationDoc,
  PressDocument,
  QuestionElement,
  QuizDoc,
  ShapeElement,
  SlideContent,
  TableElement,
  TextElement,
  WorksheetDoc,
} from "./types";
import { PAGE_SIZES } from "./types";

const FOOTER = (course: string, n: number, total: number) =>
  `${course}   ·   ${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

function zc() {
  let z = 1;
  return () => z++;
}

function T(
  nextZ: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  extra: Partial<TextElement> = {},
): TextElement {
  return {
    id: uid("t"),
    type: "text",
    x,
    y,
    w,
    h,
    z: nextZ(),
    text,
    font: "sans",
    fontSize: 22,
    fontWeight: 400,
    lineHeight: 1.35,
    color: C.ink,
    align: "left",
    ...extra,
  };
}

function S(
  nextZ: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  extra: Partial<ShapeElement> = {},
): ShapeElement {
  return {
    id: uid("s"),
    type: "shape",
    x,
    y,
    w,
    h,
    z: nextZ(),
    shape: "rect",
    fill: C.cream,
    stroke: "transparent",
    strokeWidth: 0,
    ...extra,
  };
}

function Img(
  nextZ: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  src: string,
  alt: string,
  extra: Partial<ImageElement> = {},
): ImageElement {
  return {
    id: uid("img"),
    type: "image",
    x,
    y,
    w,
    h,
    z: nextZ(),
    src,
    alt,
    fit: "cover",
    ...extra,
  };
}

function page(name: string, size: PageSizeId, background: string, elements: CanvasElement[], notes?: string): Page {
  return { id: uid("pg"), name, size, background, elements, notes };
}

function wrap(text: string, width: number, fontSize: number, weight = 400) {
  const avg = fontSize * (weight >= 600 ? 0.58 : 0.52);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length * avg > width && cur) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function textH(text: string, width: number, fontSize: number, lineHeight: number, weight = 400) {
  const lines = Math.max(1, wrap(text, width, fontSize, weight).length);
  return Math.ceil(lines * fontSize * lineHeight);
}

/* ---------- Presentation ---------- */

function compilePresentation(doc: PresentationDoc): Page[] {
  const size: PageSizeId = "widescreen";
  const total = doc.slides.length;
  return doc.slides.map((slide, i) => compileSlide(doc, slide, i, total, size));
}

function compileSlide(
  doc: PresentationDoc,
  slide: SlideContent,
  index: number,
  total: number,
  size: PageSizeId,
): Page {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const W = PAGE_SIZES[size].w;
  const H = PAGE_SIZES[size].h;
  const course = doc.course;
  const footerY = H - 64;

  const addFooter = (light = false) => {
    els.push(S(nextZ, 0, footerY, W, 64, { fill: light ? "transparent" : C.paper }));
    els.push(
      T(nextZ, 80, footerY + 18, 1200, 28, FOOTER(course, index + 1, total), {
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: 1.4,
        uppercase: true,
        color: light ? C.cream : C.muted,
      }),
    );
  };

  if (slide.layout === "title") {
    els.push(S(nextZ, 0, 0, 18, H, { fill: C.ink }));
    els.push(
      T(nextZ, 96, 220, 1400, 36, slide.kicker ?? course, {
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: 3.2,
        uppercase: true,
        color: C.rust,
      }),
    );
    els.push(
      T(nextZ, 96, 280, 1600, 160, slide.title, {
        font: "display",
        fontSize: 92,
        fontWeight: 560,
        lineHeight: 1.05,
        letterSpacing: -1.5,
        color: C.ink,
      }),
    );
    if (slide.body) {
      els.push(
        T(nextZ, 96, 480, 1100, 120, slide.body, {
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.4,
          color: C.inkSoft,
        }),
      );
    }
    els.push(S(nextZ, 96, 640, 120, 4, { fill: C.ink }));
    if (slide.visualSrc) {
      els.push(Img(nextZ, 1180, 560, 640, 360, slide.visualSrc, slide.visualAlt ?? "", { query: slide.visualQuery }));
    }
    addFooter();
    return page(slide.title, size, C.paper, els, slide.notes);
  }

  if (slide.layout === "full-visual") {
    if (slide.visualSrc) {
      els.push(Img(nextZ, 0, 0, W, H, slide.visualSrc, slide.visualAlt ?? "", { query: slide.visualQuery }));
      els.push(S(nextZ, 0, 0, W, H, { fill: "rgba(26,24,20,0.42)" }));
    }
    els.push(
      T(nextZ, 96, 360, 1600, 80, slide.kicker ?? "", {
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: 3,
        uppercase: true,
        color: C.cream,
      }),
    );
    els.push(
      T(nextZ, 96, 420, 1600, 160, slide.title, {
        font: "display",
        fontSize: 72,
        fontWeight: 560,
        lineHeight: 1.1,
        color: C.white,
      }),
    );
    if (slide.body) {
      els.push(
        T(nextZ, 96, 620, 1000, 120, slide.body, {
          fontSize: 28,
          color: C.cream,
          lineHeight: 1.4,
        }),
      );
    }
    addFooter(true);
    return page(slide.title, size, C.ink, els, slide.notes);
  }

  // Shared header for interior slides
  els.push(S(nextZ, 0, 0, 18, H, { fill: C.ink }));
  els.push(
    T(nextZ, 80, 48, 1400, 28, slide.kicker ?? course, {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 2.6,
      uppercase: true,
      color: C.rust,
    }),
  );
  els.push(
    T(nextZ, 80, 88, 1760, 90, slide.title, {
      font: "display",
      fontSize: 52,
      fontWeight: 560,
      lineHeight: 1.12,
      letterSpacing: -0.8,
    }),
  );
  els.push(S(nextZ, 80, 196, 80, 3, { fill: C.ink }));

  if (slide.layout === "objectives" || slide.layout === "split") {
    const bullets = slide.bullets ?? [];
    bullets.forEach((b, i) => {
      const y = 240 + i * 96;
      els.push(
        T(nextZ, 80, y, 64, 56, String(i + 1).padStart(2, "0"), {
          font: "display",
          fontSize: 28,
          fontWeight: 500,
          color: C.rust,
        }),
      );
      els.push(
        T(nextZ, 160, y + 6, slide.visualSrc ? 980 : 1600, 72, b, {
          fontSize: 26,
          lineHeight: 1.35,
          color: C.inkSoft,
        }),
      );
    });
    if (slide.visualSrc) {
      els.push(
        Img(nextZ, 1220, 240, 620, 680, slide.visualSrc, slide.visualAlt ?? "", {
          query: slide.visualQuery,
        }),
      );
    } else if (slide.body) {
      els.push(
        S(nextZ, 1220, 240, 620, 680, { fill: C.cream, shape: "round-rect", radius: 8 }),
      );
      els.push(
        T(nextZ, 1260, 280, 540, 40, "Keep in mind", {
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 2,
          uppercase: true,
          color: C.rust,
        }),
      );
      els.push(
        T(nextZ, 1260, 330, 540, 540, slide.body, {
          fontSize: 22,
          lineHeight: 1.45,
          color: C.inkSoft,
        }),
      );
    }
  }

  if (slide.layout === "formula" && slide.formula) {
    els.push(S(nextZ, 80, 250, 1760, 280, { fill: C.ink, shape: "round-rect", radius: 4 }));
    els.push(
      T(nextZ, 80, 310, 1760, 120, slide.formula.expression, {
        font: "display",
        fontSize: 56,
        fontWeight: 500,
        align: "center",
        color: C.paper,
      }),
    );
    els.push(
      T(nextZ, 80, 440, 1760, 48, slide.formula.caption, {
        fontSize: 20,
        align: "center",
        color: C.cream,
      }),
    );
    (slide.bullets ?? []).forEach((b, i) => {
      els.push(
        T(nextZ, 80, 580 + i * 70, 1760, 60, b, {
          fontSize: 26,
          color: C.inkSoft,
        }),
      );
    });
  }

  if (slide.layout === "cards" && slide.cards) {
    const n = slide.cards.length;
    const gap = 24;
    const usable = 1760;
    const cw = Math.floor((usable - gap * (n - 1)) / n);
    slide.cards.forEach((card, i) => {
      const x = 80 + i * (cw + gap);
      els.push(S(nextZ, x, 250, cw, 680, { fill: C.cream, shape: "round-rect", radius: 6 }));
      els.push(S(nextZ, x, 250, cw, 8, { fill: C.ink }));
      if (card.query || true) {
        // visual band
      }
      els.push(
        T(nextZ, x + 28, 290, cw - 56, 36, String(i + 1).padStart(2, "0"), {
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 2,
          color: C.rust,
        }),
      );
      els.push(
        T(nextZ, x + 28, 330, cw - 56, 80, card.title, {
          font: "display",
          fontSize: 30,
          fontWeight: 560,
          lineHeight: 1.15,
        }),
      );
      els.push(
        T(nextZ, x + 28, 430, cw - 56, 460, card.body, {
          fontSize: 20,
          lineHeight: 1.45,
          color: C.inkSoft,
        }),
      );
    });
  }

  if (slide.layout === "example" && slide.example) {
    els.push(
      T(nextZ, 80, 230, 1760, 40, slide.example.title, {
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: 1.8,
        uppercase: true,
        color: C.slate,
      }),
    );
    els.push(
      T(nextZ, 80, 280, 1760, 80, slide.example.setup, {
        fontSize: 28,
        lineHeight: 1.35,
      }),
    );
    slide.example.steps.forEach((step, i) => {
      const y = 390 + i * 88;
      els.push(S(nextZ, 80, y, 56, 56, { fill: C.ink, shape: "round-rect", radius: 4 }));
      els.push(
        T(nextZ, 80, y + 12, 56, 36, String(i + 1), {
          fontSize: 20,
          fontWeight: 600,
          align: "center",
          color: C.paper,
        }),
      );
      els.push(
        T(nextZ, 160, y + 10, 1200, 60, step, {
          fontSize: 24,
          color: C.inkSoft,
        }),
      );
    });
    els.push(S(nextZ, 1280, 390, 560, 460, { fill: C.cream, shape: "round-rect", radius: 6 }));
    els.push(
      T(nextZ, 1320, 430, 480, 28, "Result", {
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 2,
        uppercase: true,
        color: C.rust,
      }),
    );
    els.push(
      T(nextZ, 1320, 480, 480, 320, slide.example.result, {
        font: "display",
        fontSize: 36,
        fontWeight: 560,
        lineHeight: 1.25,
      }),
    );
  }

  if (slide.layout === "check") {
    (slide.bullets ?? []).forEach((b, i) => {
      const y = 240 + i * 140;
      els.push(S(nextZ, 80, y, 1760, 120, { fill: C.cream, shape: "round-rect", radius: 6 }));
      els.push(
        T(nextZ, 112, y + 36, 80, 48, String.fromCharCode(65 + i), {
          font: "display",
          fontSize: 32,
          fontWeight: 560,
          color: C.rust,
        }),
      );
      els.push(
        T(nextZ, 180, y + 38, 1580, 56, b, {
          fontSize: 26,
        }),
      );
    });
  }

  if (slide.layout === "quote") {
    els.push(
      T(nextZ, 160, 340, 1600, 280, slide.body ?? "", {
        font: "display",
        fontSize: 44,
        fontWeight: 500,
        lineHeight: 1.3,
        align: "center",
      }),
    );
    if (slide.kicker) {
      els.push(
        T(nextZ, 160, 680, 1600, 40, slide.kicker, {
          fontSize: 18,
          letterSpacing: 2,
          uppercase: true,
          align: "center",
          color: C.muted,
        }),
      );
    }
  }

  if (slide.layout === "close") {
    (slide.bullets ?? []).forEach((b, i) => {
      els.push(
        T(nextZ, 80, 250 + i * 100, 1760, 80, b, {
          fontSize: 30,
          lineHeight: 1.35,
        }),
      );
    });
    if (slide.body) {
      els.push(S(nextZ, 80, 720, 1760, 180, { fill: C.ink }));
      els.push(
        T(nextZ, 120, 770, 1680, 90, slide.body, {
          fontSize: 26,
          color: C.paper,
          lineHeight: 1.4,
        }),
      );
    }
  }

  addFooter();
  return page(slide.title || `Slide ${index + 1}`, size, C.paper, els, slide.notes);
}

/* ---------- Article ---------- */

function compileArticle(doc: ArticleDoc): Page[] {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const W = PAGE_SIZES.letter.w;
  const m = 56;

  els.push(
    T(nextZ, m, 36, W - m * 2, 28, doc.masthead, {
      font: "display",
      fontSize: 28,
      fontWeight: 600,
      align: "center",
      letterSpacing: 4,
      uppercase: true,
    }),
  );
  els.push(
    T(nextZ, m, 68, W - m * 2, 18, doc.issue ?? doc.dateline, {
      fontSize: 11,
      align: "center",
      letterSpacing: 1.6,
      uppercase: true,
      color: C.muted,
    }),
  );
  els.push(S(nextZ, m, 92, W - m * 2, 2, { fill: C.ink }));
  els.push(S(nextZ, m, 98, W - m * 2, 1, { fill: C.ink }));

  els.push(
    T(nextZ, m, 118, W - m * 2, 90, doc.headline, {
      font: "display",
      fontSize: 36,
      fontWeight: 600,
      lineHeight: 1.12,
      letterSpacing: -0.4,
    }),
  );
  const dekH = textH(doc.dek, W - m * 2, 16, 1.4);
  els.push(
    T(nextZ, m, 214, W - m * 2, dekH, doc.dek, {
      fontSize: 16,
      lineHeight: 1.4,
      italic: true,
      color: C.inkSoft,
    }),
  );
  els.push(
    T(nextZ, m, 214 + dekH + 8, W - m * 2, 18, `${doc.byline}  ·  ${doc.dateline}`, {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.8,
      uppercase: true,
      color: C.muted,
    }),
  );

  let y = 214 + dekH + 36;
  if (doc.visualSrc) {
    const imgH = 200;
    els.push(Img(nextZ, m, y, W - m * 2, imgH, doc.visualSrc, doc.visualAlt ?? "", { query: doc.visualQuery }));
    if (doc.caption) {
      els.push(
        T(nextZ, m, y + imgH + 6, W - m * 2, 32, doc.caption, {
          fontSize: 11,
          italic: true,
          color: C.muted,
        }),
      );
      y += imgH + 44;
    } else y += imgH + 16;
  }

  const colGap = 24;
  const colW = (W - m * 2 - colGap) / 2;
  const leftX = m;
  const rightX = m + colW + colGap;
  const colBottom = 900;
  let leftY = y;
  let rightY = y;
  let useLeft = true;

  const pushPara = (text: string, heading?: string) => {
    const x = useLeft ? leftX : rightX;
    let cy = useLeft ? leftY : rightY;
    if (heading) {
      const hh = textH(heading, colW, 14, 1.2, 600);
      if (cy + hh + 40 > colBottom) {
        useLeft = false;
        cy = y;
      }
      const px = useLeft ? leftX : rightX;
      els.push(
        T(nextZ, px, cy, colW, hh, heading, {
          font: "display",
          fontSize: 16,
          fontWeight: 600,
        }),
      );
      cy += hh + 8;
    }
    const ph = textH(text, colW, 13, 1.5);
    if (cy + ph > colBottom && useLeft) {
      useLeft = false;
      cy = y;
    }
    const px = useLeft ? leftX : rightX;
    els.push(
      T(nextZ, px, cy, colW, ph, text, {
        fontSize: 13,
        lineHeight: 1.5,
        color: C.inkSoft,
      }),
    );
    cy += ph + 12;
    if (useLeft) leftY = cy;
    else rightY = cy;
  };

  for (const section of doc.sections) {
    for (let i = 0; i < section.paragraphs.length; i++) {
      pushPara(section.paragraphs[i] ?? "", i === 0 ? section.heading : undefined);
    }
  }

  if (doc.pullQuote) {
    const qy = Math.max(leftY, rightY) + 8;
    if (qy < 900) {
      els.push(S(nextZ, m, qy, W - m * 2, 3, { fill: C.ink }));
      els.push(
        T(nextZ, m, qy + 14, W - m * 2, 70, doc.pullQuote, {
          font: "display",
          fontSize: 20,
          fontWeight: 500,
          italic: true,
          align: "center",
          lineHeight: 1.3,
        }),
      );
    }
  }

  if (doc.factBox) {
    const fy = 948;
    els.push(S(nextZ, m, fy, W - m * 2, 72, { fill: C.cream }));
    els.push(
      T(nextZ, m + 16, fy + 10, W - m * 2 - 32, 16, doc.factBox.title, {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        uppercase: true,
        color: C.rust,
      }),
    );
    els.push(
      T(nextZ, m + 16, fy + 30, W - m * 2 - 32, 36, doc.factBox.items.join("   ·   "), {
        fontSize: 12,
        lineHeight: 1.4,
        color: C.inkSoft,
      }),
    );
  }

  return [page(doc.headline, "letter", C.newsprint, els)];
}

/* ---------- Worksheet / notes ---------- */

function questionEl(nextZ: () => number, x: number, y: number, w: number, item: AssessmentItem, showKey = false): QuestionElement {
  const choiceH = (item.choices?.length ?? 0) * 28;
  const write = item.kind === "short" || item.kind === "fill" ? 72 : 8;
  const h = 52 + textH(item.prompt, w - 24, 14, 1.4) + choiceH + write;
  return {
    id: uid("q"),
    type: "question",
    x,
    y,
    w,
    h: Math.min(h, 280),
    z: nextZ(),
    item,
    showKey,
  };
}

function compileWorksheet(doc: WorksheetDoc): Page[] {
  const pages: Page[] = [];
  const W = PAGE_SIZES.letter.w;
  const m = 48;
  let nextZ = zc();
  let els: CanvasElement[] = [];
  let y = 40;

  const flush = (name: string) => {
    pages.push(page(name, "letter", C.paper, els));
    nextZ = zc();
    els = [];
    y = 40;
  };

  const ensure = (need: number) => {
    if (y + need > 1000) flush(doc.title);
  };

  els.push(
    T(nextZ, m, y, 500, 16, doc.course, {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.8,
      uppercase: true,
      color: C.rust,
    }),
  );
  if (doc.studentLine) {
    els.push(
      T(nextZ, 480, y, 280, 16, "Name ________________________", {
        fontSize: 12,
        color: C.muted,
        align: "right",
      }),
    );
  }
  y += 22;
  els.push(
    T(nextZ, m, y, W - m * 2, 40, doc.title, {
      font: "display",
      fontSize: 28,
      fontWeight: 600,
    }),
  );
  y += 44;
  els.push(S(nextZ, m, y, W - m * 2, 1, { fill: C.ink }));
  y += 14;
  els.push(
    T(nextZ, m, y, W - m * 2, textH(doc.directions, W - m * 2, 13, 1.45), doc.directions, {
      fontSize: 13,
      lineHeight: 1.45,
      color: C.inkSoft,
    }),
  );
  y += textH(doc.directions, W - m * 2, 13, 1.45) + 18;

  for (const section of doc.sections) {
    if (section.title) {
      ensure(40);
      els.push(
        T(nextZ, m, y, W - m * 2, 24, section.title, {
          font: "display",
          fontSize: 16,
          fontWeight: 600,
        }),
      );
      y += 28;
    }
    if (section.type === "wordbank" && section.words) {
      ensure(60);
      els.push(S(nextZ, m, y, W - m * 2, 48, { fill: C.cream, shape: "round-rect", radius: 4 }));
      els.push(
        T(nextZ, m + 12, y + 14, W - m * 2 - 24, 24, section.words.join("   ·   "), {
          fontSize: 13,
          fontWeight: 500,
          color: C.inkSoft,
        }),
      );
      y += 64;
    }
    if (section.body) {
      const h = textH(section.body, W - m * 2, 13, 1.45);
      ensure(h + 12);
      if (section.type === "example") {
        const callout: CalloutElement = {
          id: uid("c"),
          type: "callout",
          x: m,
          y,
          w: W - m * 2,
          h: h + 48,
          z: nextZ(),
          variant: "example",
          kicker: "Worked example",
          body: section.body,
        };
        els.push(callout);
        y += h + 60;
      } else {
        els.push(
          T(nextZ, m, y, W - m * 2, h, section.body, {
            fontSize: 13,
            lineHeight: 1.45,
            color: C.inkSoft,
          }),
        );
        y += h + 14;
      }
    }
    if (section.type === "notes" && section.blanks) {
      for (const blank of section.blanks) {
        ensure(36);
        els.push(
          T(nextZ, m, y, W - m * 2, 28, blank, {
            fontSize: 14,
            color: C.ink,
          }),
        );
        y += 32;
      }
    }
    if (section.items) {
      for (const item of section.items) {
        const q = questionEl(nextZ, m, y, W - m * 2, item, false);
        ensure(q.h + 12);
        q.y = y;
        els.push(q);
        y += q.h + 12;
      }
    }
    if (section.type === "scenario" && section.prompt) {
      const h = textH(section.prompt, W - m * 2, 13, 1.45);
      ensure(h + 80);
      els.push(
        T(nextZ, m, y, W - m * 2, h, section.prompt, {
          fontSize: 13,
          lineHeight: 1.45,
        }),
      );
      y += h + 8;
      els.push(S(nextZ, m, y, W - m * 2, 1, { fill: C.rule }));
      y += 18;
      els.push(S(nextZ, m, y, W - m * 2, 1, { fill: C.rule }));
      y += 18;
      els.push(S(nextZ, m, y, W - m * 2, 1, { fill: C.rule }));
      y += 28;
    }
    y += 8;
  }

  flush(doc.title);
  return pages;
}

/* ---------- Organizer ---------- */

function compileOrganizer(doc: OrganizerDoc): Page[] {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const W = PAGE_SIZES.letter.w;
  const m = 48;

  els.push(
    T(nextZ, m, 36, W - m * 2, 16, "Graphic organizer", {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.8,
      uppercase: true,
      color: C.rust,
    }),
  );
  els.push(
    T(nextZ, m, 56, W - m * 2, 40, doc.title, {
      font: "display",
      fontSize: 26,
      fontWeight: 600,
    }),
  );
  if (doc.subtitle) {
    els.push(
      T(nextZ, m, 100, W - m * 2, 36, doc.subtitle, {
        fontSize: 13,
        color: C.inkSoft,
      }),
    );
  }

  const startY = doc.subtitle ? 148 : 120;

  if (doc.template === "concept-map" || doc.template === "main-idea") {
    const cx = W / 2 - 130;
    els.push(S(nextZ, cx, startY + 200, 260, 100, { fill: C.ink, shape: "round-rect", radius: 6 }));
    els.push(
      T(nextZ, cx + 16, startY + 228, 228, 56, doc.center ?? doc.title, {
        font: "display",
        fontSize: 18,
        fontWeight: 560,
        align: "center",
        color: C.paper,
      }),
    );
    const nodes = doc.nodes.slice(0, 6);
    const positions = [
      [m, startY],
      [W / 2 - 110, startY],
      [W - m - 220, startY],
      [m, startY + 380],
      [W / 2 - 110, startY + 380],
      [W - m - 220, startY + 380],
    ];
    nodes.forEach((node, i) => {
      const [x, y] = positions[i] ?? [m, startY];
      els.push(S(nextZ, x, y, 220, 110, { fill: C.cream, shape: "round-rect", radius: 6, stroke: C.rule, strokeWidth: 1 }));
      els.push(
        T(nextZ, x + 12, y + 14, 196, 36, node.label, {
          fontSize: 14,
          fontWeight: 600,
        }),
      );
      els.push(
        T(nextZ, x + 12, y + 50, 196, 48, node.detail ?? " ", {
          fontSize: 12,
          color: C.inkSoft,
          lineHeight: 1.35,
        }),
      );
    });
  } else if (doc.template === "cause-effect") {
    const causes = doc.nodes.filter((n) => n.role === "cause");
    const effects = doc.nodes.filter((n) => n.role === "effect");
    const mid = doc.nodes.find((n) => n.role === "center");
    causes.forEach((n, i) => {
      const y = startY + i * 130;
      els.push(S(nextZ, m, y, 250, 110, { fill: C.cream, shape: "round-rect", radius: 6 }));
      els.push(T(nextZ, m + 14, y + 16, 222, 78, `${n.label}\n${n.detail ?? ""}`, { fontSize: 13, lineHeight: 1.35 }));
    });
    els.push(S(nextZ, W / 2 - 90, startY + 160, 180, 90, { fill: C.ink, shape: "round-rect", radius: 6 }));
    els.push(
      T(nextZ, W / 2 - 78, startY + 186, 156, 50, mid?.label ?? doc.center ?? "Topic", {
        fontSize: 16,
        fontWeight: 600,
        align: "center",
        color: C.paper,
      }),
    );
    effects.forEach((n, i) => {
      const y = startY + i * 130;
      els.push(S(nextZ, W - m - 250, y, 250, 110, { fill: C.wash, shape: "round-rect", radius: 6 }));
      els.push(T(nextZ, W - m - 236, y + 16, 222, 78, `${n.label}\n${n.detail ?? ""}`, { fontSize: 13, lineHeight: 1.35 }));
    });
  } else if (doc.template === "compare") {
    els.push(S(nextZ, m, startY, 330, 760, { fill: C.cream, shape: "round-rect", radius: 6 }));
    els.push(S(nextZ, W - m - 330, startY, 330, 760, { fill: C.wash, shape: "round-rect", radius: 6 }));
    const left = doc.nodes.filter((n) => n.role === "left" || n.role === "a");
    const right = doc.nodes.filter((n) => n.role === "right" || n.role === "b");
    els.push(T(nextZ, m + 16, startY + 16, 298, 32, left[0]?.label ?? "A", { font: "display", fontSize: 20, fontWeight: 600 }));
    els.push(T(nextZ, W - m - 314, startY + 16, 298, 32, right[0]?.label ?? "B", { font: "display", fontSize: 20, fontWeight: 600 }));
    left.slice(1).forEach((n, i) => {
      els.push(T(nextZ, m + 16, startY + 70 + i * 80, 298, 70, n.detail ?? n.label, { fontSize: 13, lineHeight: 1.4 }));
    });
    right.slice(1).forEach((n, i) => {
      els.push(T(nextZ, W - m - 314, startY + 70 + i * 80, 298, 70, n.detail ?? n.label, { fontSize: 13, lineHeight: 1.4 }));
    });
  } else if (doc.template === "frayer") {
    const cx = W / 2;
    const cy = 560;
    els.push(S(nextZ, m, 160, W - m * 2, 780, { fill: "transparent", stroke: C.ink, strokeWidth: 1.5 }));
    els.push(S(nextZ, W / 2 - 0.75, 160, 1.5, 780, { fill: C.ink }));
    els.push(S(nextZ, m, 550, W - m * 2, 1.5, { fill: C.ink }));
    els.push(S(nextZ, cx - 90, cy - 50, 180, 100, { fill: C.ink }));
    els.push(
      T(nextZ, cx - 80, cy - 24, 160, 56, doc.center ?? doc.nodes[0]?.label ?? "Term", {
        font: "display",
        fontSize: 18,
        fontWeight: 560,
        align: "center",
        color: C.paper,
      }),
    );
    const labels = ["Definition", "Characteristics", "Examples", "Non-examples"];
    const positions = [
      [m + 12, 176],
      [W / 2 + 12, 176],
      [m + 12, 568],
      [W / 2 + 12, 568],
    ];
    labels.forEach((lab, i) => {
      const [x, y] = positions[i] ?? [m, 176];
      els.push(T(nextZ, x, y, 300, 20, lab, { fontSize: 11, fontWeight: 700, letterSpacing: 1.2, uppercase: true, color: C.rust }));
      const node = doc.nodes[i];
      els.push(T(nextZ, x, y + 28, 300, 160, node?.detail ?? node?.label ?? "", { fontSize: 13, lineHeight: 1.4, color: C.inkSoft }));
    });
  } else if (doc.template === "sequence") {
    doc.nodes.forEach((n, i) => {
      const y = startY + i * 120;
      els.push(S(nextZ, m, y, 56, 56, { fill: C.ink, shape: "round-rect", radius: 4 }));
      els.push(T(nextZ, m, y + 14, 56, 28, String(i + 1), { fontSize: 18, fontWeight: 600, align: "center", color: C.paper }));
      els.push(S(nextZ, m + 72, y, W - m * 2 - 72, 100, { fill: C.cream, shape: "round-rect", radius: 6 }));
      els.push(T(nextZ, m + 88, y + 14, W - m * 2 - 104, 28, n.label, { fontSize: 16, fontWeight: 600 }));
      els.push(T(nextZ, m + 88, y + 46, W - m * 2 - 104, 44, n.detail ?? "", { fontSize: 13, color: C.inkSoft }));
    });
  } else {
    // KWL
    const cols = ["Know", "Want to know", "Learned"];
    const cw = (W - m * 2 - 24) / 3;
    cols.forEach((c, i) => {
      const x = m + i * (cw + 12);
      els.push(S(nextZ, x, startY, cw, 40, { fill: C.ink }));
      els.push(T(nextZ, x, startY + 10, cw, 24, c, { fontSize: 14, fontWeight: 600, align: "center", color: C.paper }));
      els.push(S(nextZ, x, startY + 40, cw, 720, { fill: C.cream, stroke: C.rule, strokeWidth: 1 }));
      const node = doc.nodes[i];
      els.push(T(nextZ, x + 12, startY + 56, cw - 24, 680, node?.detail ?? "", { fontSize: 13, lineHeight: 1.5 }));
    });
  }

  return [page(doc.title, "letter", C.paper, els)];
}

/* ---------- Quiz ---------- */

function compileQuiz(doc: QuizDoc): Page[] {
  const pages: Page[] = [];
  const W = PAGE_SIZES.letter.w;
  const m = 48;
  let nextZ = zc();
  let els: CanvasElement[] = [];
  let y = 40;

  const flush = (name: string) => {
    pages.push(page(name, "letter", C.paper, els));
    nextZ = zc();
    els = [];
    y = 48;
  };

  els.push(T(nextZ, m, y, 400, 16, doc.course, { fontSize: 11, fontWeight: 600, letterSpacing: 1.8, uppercase: true, color: C.rust }));
  els.push(T(nextZ, 480, y, 280, 16, "Name ________________________", { fontSize: 12, color: C.muted, align: "right" }));
  y += 24;
  els.push(T(nextZ, m, y, W - m * 2, 36, doc.title, { font: "display", fontSize: 26, fontWeight: 600 }));
  y += 40;
  els.push(T(nextZ, m, y, W - m * 2, 40, doc.instructions, { fontSize: 13, color: C.inkSoft, lineHeight: 1.4 }));
  y += 52;

  doc.items.forEach((item, i) => {
    const numbered: AssessmentItem = { ...item, prompt: `${i + 1}.  ${item.prompt}` };
    const q = questionEl(nextZ, m, y, W - m * 2, numbered, false);
    if (y + q.h > 1000) {
      flush(doc.title);
    }
    q.y = y;
    els.push(q);
    y += q.h + 14;
  });
  flush(doc.title);

  if (doc.includeKey) {
    nextZ = zc();
    els = [];
    y = 48;
    els.push(T(nextZ, m, y, W - m * 2, 16, "Teacher copy  ·  not for distribution", { fontSize: 11, fontWeight: 600, letterSpacing: 1.4, uppercase: true, color: C.rust }));
    y += 24;
    els.push(T(nextZ, m, y, W - m * 2, 36, `${doc.title}  —  Answer key`, { font: "display", fontSize: 24, fontWeight: 600 }));
    y += 48;
    doc.items.forEach((item, i) => {
      const answer = Array.isArray(item.correct) ? item.correct.join(", ") : (item.correct ?? "");
      const choice = item.choices?.find((c) => c.id === item.correct);
      const line = `${i + 1}.  ${choice ? `${choice.id}. ${choice.text}` : answer}${item.feedback ? `  —  ${item.feedback}` : ""}`;
      const h = textH(line, W - m * 2, 13, 1.4);
      if (y + h > 1000) {
        pages.push(page("Answer key", "letter", C.paper, els));
        nextZ = zc();
        els = [];
        y = 48;
      }
      els.push(T(nextZ, m, y, W - m * 2, h, line, { fontSize: 13, lineHeight: 1.4, color: C.inkSoft }));
      y += h + 10;
    });
    pages.push(page("Answer key", "letter", C.paper, els));
  }

  return pages;
}

/* ---------- Infographic ---------- */

function compileInfographic(doc: InfographicDoc): Page[] {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const W = PAGE_SIZES.tabloid.w;
  const m = 48;

  els.push(S(nextZ, 0, 0, W, 220, { fill: C.ink }));
  if (doc.kicker) {
    els.push(T(nextZ, m, 36, W - m * 2, 20, doc.kicker, { fontSize: 12, fontWeight: 600, letterSpacing: 2.4, uppercase: true, color: C.cream }));
  }
  els.push(T(nextZ, m, 64, W - m * 2, 80, doc.title, { font: "display", fontSize: 44, fontWeight: 560, color: C.paper, lineHeight: 1.1 }));
  els.push(T(nextZ, m, 150, W - m * 2, 48, doc.subtitle, { fontSize: 16, color: C.cream, lineHeight: 1.4 }));

  let y = 248;
  doc.bands.forEach((band, i) => {
    const h = band.stat ? 200 : 168;
    els.push(S(nextZ, m, y, 8, h, { fill: i % 2 === 0 ? C.rust : C.slate }));
    if (band.stat) {
      els.push(T(nextZ, m + 28, y, 200, 64, band.stat, { font: "display", fontSize: 48, fontWeight: 560, color: C.ink }));
    }
    els.push(T(nextZ, m + 28, y + (band.stat ? 64 : 8), band.src ? 400 : 680, 20, band.kicker, { fontSize: 11, fontWeight: 700, letterSpacing: 1.8, uppercase: true, color: C.rust }));
    els.push(T(nextZ, m + 28, y + (band.stat ? 88 : 32), band.src ? 400 : 680, 36, band.title, { font: "display", fontSize: 22, fontWeight: 600 }));
    els.push(T(nextZ, m + 28, y + (band.stat ? 128 : 72), band.src ? 400 : 680, 60, band.body, { fontSize: 14, lineHeight: 1.4, color: C.inkSoft }));
    if (band.src) {
      els.push(Img(nextZ, 500, y + 16, 236, h - 32, band.src, band.title, { query: band.query }));
    }
    y += h + 16;
  });

  if (doc.footer) {
    els.push(T(nextZ, m, PAGE_SIZES.tabloid.h - 56, W - m * 2, 24, doc.footer, { fontSize: 11, color: C.muted }));
  }

  return [page(doc.title, "tabloid", C.paper, els)];
}

/* ---------- Lesson plan ---------- */

function compileLessonPlan(doc: LessonPlanDoc): Page[] {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const W = PAGE_SIZES.letter.w;
  const m = 48;
  let y = 40;

  els.push(T(nextZ, m, y, W - m * 2, 16, `${doc.course}  ·  ${doc.duration}`, { fontSize: 11, fontWeight: 600, letterSpacing: 1.6, uppercase: true, color: C.rust }));
  y += 22;
  els.push(T(nextZ, m, y, W - m * 2, 40, doc.title, { font: "display", fontSize: 26, fontWeight: 600 }));
  y += 48;

  const block = (kicker: string, body: string) => {
    const h = textH(body, W - m * 2, 13, 1.45);
    els.push(T(nextZ, m, y, W - m * 2, 16, kicker, { fontSize: 11, fontWeight: 700, letterSpacing: 1.4, uppercase: true, color: C.slate }));
    y += 20;
    els.push(T(nextZ, m, y, W - m * 2, h, body, { fontSize: 13, lineHeight: 1.45, color: C.inkSoft }));
    y += h + 18;
  };

  block("Objectives", doc.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n"));
  block("Materials", doc.materials.join("  ·  "));

  els.push(T(nextZ, m, y, W - m * 2, 16, "Sequence", { fontSize: 11, fontWeight: 700, letterSpacing: 1.4, uppercase: true, color: C.slate }));
  y += 20;

  const table: TableElement = {
    id: uid("tbl"),
    type: "table",
    x: m,
    y,
    w: W - m * 2,
    h: Math.min(420, 36 + doc.sequence.length * 64),
    z: nextZ(),
    columns: ["Time", "Phase", "Teacher", "Students"],
    rows: doc.sequence.map((s) => [
      s.minutes ? `${s.minutes} min` : "—",
      s.phase,
      s.teacher,
      s.student,
    ]),
    headerFill: C.ink,
    headerColor: C.paper,
    cellColor: C.inkSoft,
    border: C.rule,
  };
  els.push(table);
  y += table.h + 20;

  block("Checks for understanding", doc.checks.join("\n"));
  block("Differentiation", doc.differentiation.join("\n"));
  block("Closure", doc.closure);

  return [page(doc.title, "letter", C.paper, els)];
}

function compileCanvasPage(doc: { kind: "canvas-page"; title: string; blocks: { heading?: string; html: string }[] }): Page[] {
  const nextZ = zc();
  const els: CanvasElement[] = [];
  const m = 48;
  let y = 40;
  els.push(T(nextZ, m, y, 720, 40, doc.title, { font: "display", fontSize: 28, fontWeight: 600 }));
  y += 56;
  for (const b of doc.blocks) {
    if (b.heading) {
      els.push(T(nextZ, m, y, 720, 24, b.heading, { fontSize: 16, fontWeight: 600 }));
      y += 28;
    }
    const h = textH(b.html.replace(/<[^>]+>/g, " "), 720, 14, 1.45);
    els.push(T(nextZ, m, y, 720, h, b.html.replace(/<[^>]+>/g, ""), { fontSize: 14, lineHeight: 1.45, color: C.inkSoft }));
    y += h + 16;
  }
  return [page(doc.title, "letter", C.paper, els)];
}

export function compileDocument(doc: PressDocument): Page[] {
  switch (doc.kind) {
    case "presentation":
    case "visual-lesson":
      return compilePresentation(doc);
    case "news-article":
    case "reading":
    case "magazine":
      return compileArticle(doc);
    case "worksheet":
    case "guided-notes":
    case "activity":
    case "study-guide":
    case "reference":
      return compileWorksheet(doc);
    case "organizer":
      return compileOrganizer(doc);
    case "quiz":
    case "test":
    case "exit-ticket":
      return compileQuiz(doc);
    case "infographic":
    case "poster":
      return compileInfographic(doc);
    case "lesson-plan":
    case "teacher-guide":
      return compileLessonPlan(doc);
    case "canvas-page":
      return compileCanvasPage(doc);
    default:
      return [];
  }
}

export function artifactFromDoc(format: FormatId, title: string, doc: PressDocument, extra?: Partial<Artifact>): Artifact {
  return {
    id: uid("art"),
    format,
    title,
    createdAt: new Date().toISOString(),
    doc,
    pages: compileDocument(doc),
    ...extra,
  };
}

export function recompileArtifact(artifact: Artifact): Artifact {
  return { ...artifact, pages: compileDocument(artifact.doc) };
}

export { formatMeta };
