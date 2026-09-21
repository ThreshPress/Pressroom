import JSZip from "jszip";
import type { AssessmentItem, QuizDoc } from "./types";

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;")
    .replaceAll("'", "\u0026apos;");
}

function itemXml(item: AssessmentItem, index: number): string {
  const ident = item.id || `Q${index + 1}`;
  const prompt = xmlEscape(item.prompt);
  if (item.kind === "tf") {
    const correct = String(item.correct ?? "true").toLowerCase() === "true" ? "T" : "F";
    return `<item ident="${ident}" title="Item ${index + 1}">
  <presentation>
    <material><mattext texttype="text/plain">${prompt}</mattext></material>
    <response_lid ident="RESPONSE" rcardinality="Single">
      <render_choice>
        <response_label ident="T"><material><mattext>True</mattext></material></response_label>
        <response_label ident="F"><material><mattext>False</mattext></material></response_label>
      </render_choice>
    </response_lid>
  </presentation>
  <resprocessing>
    <outcomes><decvar vartype="Decimal" varname="SCORE" defaultval="0"/></outcomes>
    <respcondition continue="No">
      <conditionvar><varequal respident="RESPONSE">${correct}</varequal></conditionvar>
      <setvar action="Set" varname="SCORE">${item.points}</setvar>
    </respcondition>
  </resprocessing>
</item>`;
  }

  if (item.kind === "short" || item.kind === "fill") {
    const answer = xmlEscape(String(Array.isArray(item.correct) ? item.correct[0] : item.correct ?? ""));
    return `<item ident="${ident}" title="Item ${index + 1}">
  <presentation>
    <material><mattext texttype="text/plain">${prompt}</mattext></material>
    <response_str ident="RESPONSE" rcardinality="Single">
      <render_fib fibtype="String"><response_label ident="answer"/></render_fib>
    </response_str>
  </presentation>
  <resprocessing>
    <outcomes><decvar vartype="Decimal" varname="SCORE" defaultval="0"/></outcomes>
    <respcondition continue="No">
      <conditionvar><varequal respident="RESPONSE" case="no">${answer}</varequal></conditionvar>
      <setvar action="Set" varname="SCORE">${item.points}</setvar>
    </respcondition>
  </resprocessing>
</item>`;
  }

  const choices = item.choices ?? [];
  const correct = String(item.correct ?? choices[0]?.id ?? "A");
  const labels = choices
    .map(
      (c) =>
        `<response_label ident="${xmlEscape(c.id)}"><material><mattext texttype="text/plain">${xmlEscape(c.text)}</mattext></material></response_label>`,
    )
    .join("\n        ");
  return `<item ident="${ident}" title="Item ${index + 1}">
  <presentation>
    <material><mattext texttype="text/plain">${prompt}</mattext></material>
    <response_lid ident="RESPONSE" rcardinality="Single">
      <render_choice>
        ${labels}
      </render_choice>
    </response_lid>
  </presentation>
  <resprocessing>
    <outcomes><decvar vartype="Decimal" varname="SCORE" defaultval="0"/></outcomes>
    <respcondition continue="No">
      <conditionvar><varequal respident="RESPONSE">${xmlEscape(correct)}</varequal></conditionvar>
      <setvar action="Set" varname="SCORE">${item.points}</setvar>
    </respcondition>
  </resprocessing>
</item>`;
}

export async function buildQtiZip(doc: QuizDoc): Promise<Blob> {
  const ident = `pressroom_${doc.title.replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}`;
  const items = doc.items.map((it, i) => itemXml(it, i)).join("\n");
  const qti = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <assessment ident="${ident}" title="${xmlEscape(doc.title)}">
    <section ident="root">
      ${items}
    </section>
  </assessment>
</questestinterop>`;

  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${ident}_manifest" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1.3</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${ident}_res" type="imsqti_xmlv1p2" href="assessment.xml">
      <file href="assessment.xml"/>
    </resource>
  </resources>
</manifest>`;

  const zip = new JSZip();
  zip.file("imsmanifest.xml", manifest);
  zip.file("assessment.xml", qti);
  return zip.generateAsync({ type: "blob" });
}

export function collectQuizDoc(artifactDoc: unknown): QuizDoc | null {
  if (!artifactDoc || typeof artifactDoc !== "object") return null;
  const d = artifactDoc as QuizDoc;
  if ((d.kind === "quiz" || d.kind === "test" || d.kind === "exit-ticket") && Array.isArray(d.items)) return d;
  return null;
}
