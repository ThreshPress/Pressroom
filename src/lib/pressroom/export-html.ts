import type { Artifact, AssessmentItem, PressDocument } from "./types";

function esc(s: string) {
  return s
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;");
}

function itemHtml(item: AssessmentItem, i: number) {
  const choices = (item.choices ?? [])
    .map((c) => `<li>${esc(c.id)}. ${esc(c.text)}</li>`)
    .join("");
  return `<div class="pr-q">
  <p><strong>${i + 1}.</strong> ${esc(item.prompt)}</p>
  ${choices ? `<ol type="A">${choices}</ol>` : `<p class="pr-line">_______________________________</p>`}
</div>`;
}

export function canvasPageHtml(artifact: Artifact): string {
  const doc = artifact.doc;
  const inner = renderDoc(doc);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(artifact.title)}</title>
<style>
  body { margin:0; background:#f4efe6; color:#1a1814; font: 16px/1.5 "Source Sans 3", "Segoe UI", sans-serif; }
  .pr { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { font-family: Georgia, "Times New Roman", serif; font-weight: 600; font-size: 1.8rem; line-height: 1.15; margin: 0 0 12px; }
  h2 { font-size: 1.05rem; margin: 28px 0 8px; }
  p { margin: 0 0 12px; }
  .kicker { letter-spacing: .14em; text-transform: uppercase; font-size: 11px; color: #7a3e2e; font-weight: 700; }
  .callout { background: #efe8da; padding: 14px 16px; margin: 16px 0; border-left: 3px solid #1a1814; }
  .pr-q { margin: 16px 0; padding-bottom: 12px; border-bottom: 1px solid #ddd6c8; }
  .pr-line { color: #6e6860; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0 20px; }
  th, td { border: 1px solid #ddd6c8; padding: 8px 10px; text-align: left; vertical-align: top; font-size: 14px; }
  th { background: #1a1814; color: #fbf8f2; font-weight: 600; }
  ul { margin: 0 0 12px; padding-left: 1.2em; }
</style>
</head>
<body>
<main class="pr">
${inner}
</main>
</body>
</html>`;
}

function renderDoc(doc: PressDocument): string {
  switch (doc.kind) {
    case "presentation":
    case "visual-lesson":
      return doc.slides
        .map(
          (s, i) => `<section>
  <p class="kicker">${esc(s.kicker ?? `Slide ${i + 1}`)}</p>
  <h2>${esc(s.title)}</h2>
  ${s.body ? `<p>${esc(s.body)}</p>` : ""}
  ${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
</section>`,
        )
        .join("\n");
    case "news-article":
    case "reading":
    case "magazine":
      return `<p class="kicker">${esc(doc.masthead)}</p>
<h1>${esc(doc.headline)}</h1>
<p><em>${esc(doc.dek)}</em></p>
<p>${esc(doc.byline)} · ${esc(doc.dateline)}</p>
${doc.sections.map((sec) => `${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ""}${sec.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}`).join("")}
${doc.factBox ? `<div class="callout"><strong>${esc(doc.factBox.title)}</strong><p>${esc(doc.factBox.items.join(" · "))}</p></div>` : ""}`;
    case "worksheet":
    case "guided-notes":
    case "activity":
    case "study-guide":
    case "reference":
      return `<p class="kicker">${esc(doc.course)}</p><h1>${esc(doc.title)}</h1><p>${esc(doc.directions)}</p>
${doc.sections
  .map((sec) => {
    const head = sec.title ? `<h2>${esc(sec.title)}</h2>` : "";
    const body = sec.body ? `<div class="callout">${esc(sec.body)}</div>` : "";
    const items = sec.items?.map((it, i) => itemHtml(it, i)).join("") ?? "";
    const blanks = sec.blanks?.map((b) => `<p>${esc(b)}</p>`).join("") ?? "";
    const prompt = sec.prompt ? `<p>${esc(sec.prompt)}</p>` : "";
    return head + body + items + blanks + prompt;
  })
  .join("")}`;
    case "quiz":
    case "test":
    case "exit-ticket":
      return `<p class="kicker">${esc(doc.course)}</p><h1>${esc(doc.title)}</h1><p>${esc(doc.instructions)}</p>
${doc.items.map((it, i) => itemHtml(it, i)).join("")}`;
    case "organizer":
      return `<h1>${esc(doc.title)}</h1><p>${esc(doc.subtitle ?? "")}</p>
<ul>${doc.nodes.map((n) => `<li><strong>${esc(n.label)}</strong> — ${esc(n.detail ?? "")}</li>`).join("")}</ul>`;
    case "infographic":
    case "poster":
      return `<p class="kicker">${esc(doc.kicker ?? "")}</p><h1>${esc(doc.title)}</h1><p>${esc(doc.subtitle)}</p>
${doc.bands.map((b) => `<div class="callout"><p class="kicker">${esc(b.kicker)}</p><h2>${esc(b.title)}${b.stat ? ` — ${esc(b.stat)}` : ""}</h2><p>${esc(b.body)}</p></div>`).join("")}`;
    case "lesson-plan":
    case "teacher-guide":
      return `<p class="kicker">${esc(doc.course)} · ${esc(doc.duration)}</p><h1>${esc(doc.title)}</h1>
<h2>Objectives</h2><ul>${doc.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
<h2>Sequence</h2>
<table><thead><tr><th>Time</th><th>Phase</th><th>Teacher</th><th>Students</th></tr></thead>
<tbody>${doc.sequence.map((s) => `<tr><td>${s.minutes ?? "—"} min</td><td>${esc(s.phase)}</td><td>${esc(s.teacher)}</td><td>${esc(s.student)}</td></tr>`).join("")}</tbody></table>
<h2>Differentiation</h2><ul>${doc.differentiation.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
<h2>Closure</h2><p>${esc(doc.closure)}</p>`;
    case "canvas-page":
      return `<h1>${esc(doc.title)}</h1>${doc.blocks.map((b) => `${b.heading ? `<h2>${esc(b.heading)}</h2>` : ""}${b.html}`).join("")}`;
    default:
      return `<h1>${esc("Untitled")}</h1>`;
  }
}
