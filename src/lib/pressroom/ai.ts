import { createServerFn } from "@tanstack/react-start";
import type { Blueprint, FormatId, PressDocument, TeachingProfile } from "./types";
import { FORMATS } from "./formats";

const MODEL = "grok-4.5";

async function chat(system: string, user: string, maxTokens = 6000): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment." };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `xAI API error ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}` };
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true, text: json.choices?.[0]?.message?.content ?? "" };
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("No JSON object in model output");
  return JSON.parse(raw.slice(start, end + 1));
}

const BLUEPRINT_SYS = `You are Pressroom, an instructional designer for a professional curriculum studio.
Return ONLY JSON matching this shape:
{
  "topic": string,
  "audience": string,
  "gradeBand": string,
  "drivingQuestion": string,
  "objectives": string[],
  "prerequisites": string[],
  "vocabulary": [{"term": string, "definition": string}],
  "concepts": [{"name": string, "summary": string}],
  "examples": [{"title": string, "setup": string, "steps": string[], "result": string}],
  "sequence": [{"phase": string, "minutes": number, "teacher": string, "student": string}],
  "guidedPractice": string[],
  "independentPractice": string[],
  "checks": string[],
  "misconceptions": [{"myth": string, "repair": string}],
  "assessment": string,
  "differentiation": string[],
  "answerNotes": string[],
  "sources": [{"label": string, "note": string}]
}
Rules:
- Be accurate. Do not invent citations or specific current statistics. Label examples as examples.
- Age-appropriate voice. Never childish unless the profile asks for elementary.
- Objectives must be measurable.
- Sources may only be general (e.g. "state department of revenue") — never fake URLs or papers.`;

export const developBlueprint = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; profile: TeachingProfile }) => input)
  .handler(async ({ data }) => {
    const user = `Teacher request:\n${data.prompt}\n\nTeaching profile: ${data.profile.name} (${data.profile.gradeBand})\nAppearance: ${data.profile.appearance}\nReading: ${data.profile.reading}\nNotes: ${data.profile.notes}\nTraits: ${data.profile.traits.join("; ")}`;
    const result = await chat(BLUEPRINT_SYS, user, 4000);
    if (!result.ok) return result;
    try {
      const blueprint = extractJson(result.text) as Blueprint;
      if (!blueprint.topic || !Array.isArray(blueprint.objectives)) {
        return { ok: false as const, error: "Blueprint was incomplete. Try again." };
      }
      return { ok: true as const, blueprint };
    } catch {
      return { ok: false as const, error: "Could not parse the blueprint. Try again." };
    }
  });

function pressSystem(format: FormatId) {
  const meta = FORMATS.find((f) => f.id === format);
  return `You are Pressroom's press operator. You transform an instructional BLUEPRINT into a format-specific document.
The output is NOT the same text dropped into a new template. Rhetoric must change to fit the medium.
Format: ${meta?.label} — ${meta?.hint}

Return ONLY JSON with key "doc" whose shape depends on format:

PRESENTATION / VISUAL LESSON:
{ "kind": "presentation"|"visual-lesson", "template": "modern-classroom"|"minimal"|"editorial"|"visual", "course": string,
  "slides": [{ "layout": "title"|"objectives"|"split"|"formula"|"cards"|"example"|"check"|"quote"|"close"|"full-visual",
    "kicker"?: string, "title": string, "body"?: string, "bullets"?: string[],
    "formula"?: {"expression": string, "caption": string},
    "cards"?: [{"title": string, "body": string}],
    "example"?: {"title": string, "setup": string, "steps": string[], "result": string},
    "visualQuery"?: string, "visualAlt"?: string, "notes"?: string }] }
8–12 slides. One idea per slide. Short headlines. visualQuery is a 3–6 word photo search.

NEWS / READING / MAGAZINE:
{ "kind": "news-article"|"reading"|"magazine", "template": "newspaper"|"modern-news"|"magazine"|"journal",
  "masthead": string, "issue"?: string, "headline": string, "dek": string, "byline": string, "dateline": string,
  "sections": [{"heading"?: string, "paragraphs": string[]}],
  "pullQuote"?: string, "factBox"?: {"title": string, "items": string[]},
  "visualQuery"?: string, "visualAlt"?: string, "caption"?: string }
Real prose. Inverted pyramid for news. No bullet dumps.

WORKSHEET / GUIDED NOTES / ACTIVITY / STUDY GUIDE / REFERENCE:
{ "kind": "...", "template": "practice"|"guided"|"visual"|"scenario"|"vocabulary"|"review",
  "title": string, "course": string, "studentLine": true, "directions": string,
  "sections": [{"type": "intro"|"example"|"questions"|"wordbank"|"scenario"|"notes", "title"?: string, "body"?: string,
    "items"?: [{"id": string, "kind": "mcq"|"tf"|"short"|"fill", "prompt": string, "choices"?: [{"id": string, "text": string}], "correct"?: string, "points": number, "feedback"?: string}],
    "words"?: string[], "prompt"?: string, "blanks"?: string[] }] }
Response opportunities required. Include a worked example on worksheets.

ORGANIZER:
{ "kind": "organizer", "template": "cause-effect"|"compare"|"sequence"|"frayer"|"concept-map"|"main-idea"|"kwl",
  "title": string, "subtitle"?: string, "center"?: string,
  "nodes": [{"id": string, "label": string, "detail"?: string, "role"?: string}] }

QUIZ / TEST / EXIT TICKET:
{ "kind": "quiz"|"test"|"exit-ticket", "title": string, "course": string, "instructions": string, "includeKey": true,
  "items": [{"id": string, "kind": "mcq"|"tf"|"short", "prompt": string, "choices"?: [{"id":"A"|"B"|"C"|"D","text": string}], "correct": string, "points": number, "feedback"?: string, "objective"?: string}] }
Map items to objectives. Exit tickets: 3 items max.

INFOGRAPHIC / POSTER:
{ "kind": "infographic"|"poster", "title": string, "subtitle": string, "kicker"?: string,
  "bands": [{"kicker": string, "title": string, "body": string, "stat"?: string, "query"?: string}], "footer"?: string }
Almost no paragraphs. Hierarchy and brevity.

LESSON PLAN / TEACHER GUIDE:
{ "kind": "lesson-plan"|"teacher-guide", "title": string, "course": string, "duration": string,
  "objectives": string[], "materials": string[],
  "sequence": [{"phase": string, "minutes": number, "teacher": string, "student": string}],
  "checks": string[], "differentiation": string[], "closure": string, "notes"?: string[] }

CANVAS PAGE:
{ "kind": "canvas-page", "title": string, "blocks": [{"heading"?: string, "html": string}] }
html is simple semantic snippets (p, ul, strong). No scripts.

Accuracy: do not invent sources or live local tax rates. Label numerical examples as examples.
Voice: ${meta?.blurb}`;
}

export const pressDocument = createServerFn({ method: "POST" })
  .validator(
    (input: {
      format: FormatId;
      blueprint: Blueprint;
      profile: TeachingProfile;
      sourceHint?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const user = `Press this blueprint into format "${data.format}".
Profile: ${data.profile.name} — ${data.profile.notes} — ${data.profile.traits.join("; ")}
Reading: ${data.profile.reading}. Appearance: ${data.profile.appearance}.
${data.sourceHint ? `Additional direction: ${data.sourceHint}` : ""}

BLUEPRINT JSON:
${JSON.stringify(data.blueprint)}`;
    const result = await chat(pressSystem(data.format), user, 7000);
    if (!result.ok) return result;
    try {
      const parsed = extractJson(result.text) as { doc?: PressDocument } & PressDocument;
      const doc = ("doc" in parsed && parsed.doc ? parsed.doc : parsed) as PressDocument;
      if (!doc || !("kind" in doc)) return { ok: false as const, error: "Press returned an empty document." };
      return { ok: true as const, doc };
    } catch {
      return { ok: false as const, error: "Could not parse the pressed document. Try again." };
    }
  });

export const askPressroom = createServerFn({ method: "POST" })
  .validator(
    (input: {
      instruction: string;
      profile: TeachingProfile;
      format: FormatId;
      doc: PressDocument;
      pageName?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sys = `You are Ask Pressroom. You MODIFY the instructional document. Do not merely advise.
Return JSON: { "message": string, "doc": <updated document of the same kind> }
Preserve structure keys. Apply the teacher's instruction. Keep facts accurate.
If they ask to shorten, cut. If they ask for a real-world example, add one. If they ask to change question types, change them.
Profile: ${data.profile.name} (${data.profile.reading}, ${data.profile.appearance}).`;
    const user = `Format: ${data.format}
Current page: ${data.pageName ?? "n/a"}
Instruction: ${data.instruction}

DOCUMENT:
${JSON.stringify(data.doc)}`;
    const result = await chat(sys, user, 7000);
    if (!result.ok) return result;
    try {
      const parsed = extractJson(result.text) as { message?: string; doc: PressDocument };
      if (!parsed.doc) return { ok: false as const, error: "No updated document returned." };
      return { ok: true as const, message: parsed.message ?? "Updated.", doc: parsed.doc };
    } catch {
      return { ok: false as const, error: "Could not parse the edit. Try again." };
    }
  });

export const adaptDocument = createServerFn({ method: "POST" })
  .validator(
    (input: {
      doc: PressDocument;
      profile: TeachingProfile;
      reading: "original" | "accessible" | "simplified";
      supports: string[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const sys = `You adapt instructional materials while preserving the learning objective.
Return JSON: { "doc": <same kind, adapted> }
Apply reading level "${data.reading}".
Supports to apply: ${data.supports.join(", ") || "none"}.
Rules: do not dumb down the idea. Shorten sentences, chunk, reduce choices, add word banks or sentence starters as requested.
Keep numbers in examples consistent with the original.`;
    const result = await chat(sys, `PROFILE: ${JSON.stringify(data.profile)}\n\nDOC:\n${JSON.stringify(data.doc)}`, 7000);
    if (!result.ok) return result;
    try {
      const parsed = extractJson(result.text) as { doc: PressDocument };
      return { ok: true as const, doc: parsed.doc };
    } catch {
      return { ok: false as const, error: "Could not parse the adaptation." };
    }
  });

export const searchOpenverse = createServerFn({ method: "POST" })
  .validator((input: { query: string }) => input)
  .handler(async ({ data }) => {
    const q = data.query.trim();
    if (!q) return { ok: true as const, hits: [] };
    try {
      const url = new URL("https://api.openverse.org/v1/images/");
      url.searchParams.set("q", q);
      url.searchParams.set("license_type", "commercial");
      url.searchParams.set("page_size", "12");
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return { ok: false as const, error: `Image search failed (${res.status})` };
      const json = (await res.json()) as {
        results?: { id: string; title: string; url: string; thumbnail?: string; creator?: string; license?: string }[];
      };
      const hits = (json.results ?? []).map((r) => ({
        id: r.id,
        src: r.url,
        thumb: r.thumbnail ?? r.url,
        alt: r.title || q,
        credit: r.creator ? `${r.creator}` : undefined,
        license: r.license,
        query: q,
      }));
      return { ok: true as const, hits };
    } catch {
      return { ok: false as const, error: "Image search is unavailable." };
    }
  });

export const generateVisual = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment." };
    const prompt = `Photoreal, documentary, age-appropriate educational photograph. No people who appear under 18. No legible text or logos. Quiet, serious, natural light. ${data.prompt}`;
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt,
        n: 1,
        resolution: "1k",
      }),
    });
    if (!res.ok) return { ok: false as const, error: `Image generation failed (${res.status})` };
    const json = (await res.json()) as { data?: { url?: string }[] };
    const src = json.data?.[0]?.url;
    if (!src) return { ok: false as const, error: "No image returned." };
    return {
      ok: true as const,
      hit: { id: `gen-${Date.now()}`, src, alt: data.prompt, credit: "Generated in Pressroom", query: data.prompt },
    };
  });

export const editVisual = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; imageUrl: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment." };
    const img = await fetch(data.imageUrl);
    if (!img.ok) return { ok: false as const, error: "Could not load the image to edit." };
    const blob = await img.blob();
    const form = new FormData();
    form.set("model", "grok-imagine-image");
    form.set("prompt", data.prompt);
    form.set("image", blob, "source.jpg");
    const res = await fetch("https://api.x.ai/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return { ok: false as const, error: `Edit failed (${res.status})` };
    const json = (await res.json()) as { data?: { url?: string }[] };
    const src = json.data?.[0]?.url;
    if (!src) return { ok: false as const, error: "No edited image returned." };
    return { ok: true as const, src };
  });
