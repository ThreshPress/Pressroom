import type { FormatId, PageSizeId, PressCategory } from "./types";

export interface FormatMeta {
  id: FormatId;
  category: PressCategory;
  label: string;
  blurb: string;
  pageSize: PageSizeId;
  hint: string;
}

export const CATEGORIES: { id: PressCategory; label: string }[] = [
  { id: "present", label: "Present" },
  { id: "read", label: "Read" },
  { id: "practice", label: "Practice" },
  { id: "assess", label: "Assess" },
  { id: "visualize", label: "Visualize" },
  { id: "publish", label: "Publish" },
  { id: "lms", label: "LMS" },
];

export const FORMATS: FormatMeta[] = [
  {
    id: "presentation",
    category: "present",
    label: "Presentation",
    blurb: "Paced slides. One idea at a time.",
    pageSize: "widescreen",
    hint: "Short headlines, visual hierarchy, speaker notes.",
  },
  {
    id: "visual-lesson",
    category: "present",
    label: "Visual Lesson",
    blurb: "Image-led teaching sequence.",
    pageSize: "widescreen",
    hint: "Lead with a visual, then a tight caption and a question.",
  },
  {
    id: "news-article",
    category: "read",
    label: "News Article",
    blurb: "Journalistic prose, columns, captions.",
    pageSize: "letter",
    hint: "Headline, dek, inverted pyramid, pull quote, fact box.",
  },
  {
    id: "reading",
    category: "read",
    label: "Reading Passage",
    blurb: "Informational text for close reading.",
    pageSize: "letter",
    hint: "Accessible prose, section heads, vocabulary in context.",
  },
  {
    id: "magazine",
    category: "read",
    label: "Magazine",
    blurb: "Editorial feature with visual pacing.",
    pageSize: "letter",
    hint: "Drop cap energy without gimmicks. Sidebars, captions.",
  },
  {
    id: "worksheet",
    category: "practice",
    label: "Worksheet",
    blurb: "Worked example plus graduated practice.",
    pageSize: "letter",
    hint: "Response space, real numbers, not a wall of text.",
  },
  {
    id: "guided-notes",
    category: "practice",
    label: "Guided Notes",
    blurb: "Fill-in companion to the lesson.",
    pageSize: "letter",
    hint: "Chunked blanks, not a transcript of the slides.",
  },
  {
    id: "organizer",
    category: "practice",
    label: "Graphic Organizer",
    blurb: "Relationships, not paragraphs.",
    pageSize: "letter",
    hint: "Boxes, arrows, student writing space inside the structure.",
  },
  {
    id: "activity",
    category: "practice",
    label: "Activity",
    blurb: "A scenario students can do.",
    pageSize: "letter",
    hint: "Roles, constraints, a product, a debrief.",
  },
  {
    id: "study-guide",
    category: "practice",
    label: "Study Guide",
    blurb: "Condensed retrieval for later.",
    pageSize: "letter",
    hint: "Definitions, key formulas, self-check prompts.",
  },
  {
    id: "quiz",
    category: "assess",
    label: "Quiz",
    blurb: "Measurable questions from the objectives.",
    pageSize: "letter",
    hint: "Structured items with keys. No trick wording.",
  },
  {
    id: "test",
    category: "assess",
    label: "Test",
    blurb: "Longer, broader coverage.",
    pageSize: "letter",
    hint: "Mix of item types. Map each item to an objective.",
  },
  {
    id: "exit-ticket",
    category: "assess",
    label: "Exit Ticket",
    blurb: "Two or three checks for the last five minutes.",
    pageSize: "letter",
    hint: "Fast to complete, diagnostic, one written response max.",
  },
  {
    id: "infographic",
    category: "visualize",
    label: "Infographic",
    blurb: "Hierarchy and brevity. Almost no paragraphs.",
    pageSize: "tabloid",
    hint: "Stats, bands, flow. If it needs a paragraph, cut it.",
  },
  {
    id: "poster",
    category: "visualize",
    label: "Poster",
    blurb: "One idea, readable from a few feet.",
    pageSize: "poster",
    hint: "Giant type, one visual, one takeaway.",
  },
  {
    id: "reference",
    category: "visualize",
    label: "Reference Sheet",
    blurb: "Keep-at-desk summary.",
    pageSize: "letter",
    hint: "Formula, vocabulary, exemptions, a worked mini-example.",
  },
  {
    id: "lesson-plan",
    category: "publish",
    label: "Lesson Plan",
    blurb: "Teacher-facing sequence and timing.",
    pageSize: "letter",
    hint: "Objectives, materials, beats, checks, differentiation.",
  },
  {
    id: "teacher-guide",
    category: "publish",
    label: "Teacher Guide",
    blurb: "Answer notes, misconceptions, pacing.",
    pageSize: "letter",
    hint: "What to listen for. What to do when they miss it.",
  },
  {
    id: "canvas-page",
    category: "lms",
    label: "Canvas Page",
    blurb: "Clean HTML for an LMS page.",
    pageSize: "letter",
    hint: "Headings, callouts, tables. No unsupported widgets.",
  },
];

export function formatMeta(id: FormatId): FormatMeta {
  const found = FORMATS.find((f) => f.id === id);
  if (!found) throw new Error(`Unknown format ${id}`);
  return found;
}

export function recommendFormats(blueprintTopic: string, objectives: string[]): FormatId[] {
  const text = `${blueprintTopic} ${objectives.join(" ")}`.toLowerCase();
  const rec: FormatId[] = ["presentation", "worksheet", "quiz"];
  if (/cause|effect|consequence|why|impact/.test(text)) rec.push("organizer");
  if (/tax|money|budget|percent|rate/.test(text)) rec.push("infographic");
  if (/history|civics|news|current|policy/.test(text)) rec.push("news-article");
  rec.push("guided-notes", "lesson-plan", "exit-ticket");
  return [...new Set(rec)];
}
