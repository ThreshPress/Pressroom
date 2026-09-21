import JSZip from "jszip";
import { uid } from "@/lib/utils";
import type { SourceFile } from "./types";

const MAX_FILES = 8;
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_TEXT = 24_000;

export const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.odt,.rtf,.txt,.md,.markdown,.csv,.html,.htm,.json,.png,.jpg,.jpeg,.webp,.gif,.svg";

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function kindOf(name: string, mime: string): SourceFile["kind"] {
  const ext = extOf(name);
  if (IMAGE_EXT.has(ext) || mime.startsWith("image/")) return "image";
  if (ext === "ppt" || ext === "pptx") return "slides";
  if (ext === "txt" || ext === "md" || ext === "markdown" || ext === "csv" || ext === "json") return "text";
  if (ext === "html" || ext === "htm" || ext === "rtf") return "text";
  if (ext === "pdf" || ext === "doc" || ext === "docx" || ext === "odt") return "document";
  return "other";
}

function decodeEntities(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripXml(xml: string) {
  return decodeEntities(
    xml
      .replace(/<w:tab\b[^/]*\/>/g, "\t")
      .replace(/<a:br\b[^/]*\/>/g, "\n")
      .replace(/<(w:p|a:p|text:p|p)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function cap(text: string) {
  if (text.length <= MAX_TEXT) return text;
  return `${text.slice(0, MAX_TEXT)}\n\n[truncated]`;
}

async function extractZipXml(buf: ArrayBuffer, paths: string[]) {
  const zip = await JSZip.loadAsync(buf);
  const chunks: string[] = [];
  for (const path of paths) {
    const file = zip.file(path);
    if (file) chunks.push(await file.async("string"));
  }
  if (chunks.length) return chunks;
  const matches: string[] = [];
  zip.forEach((name, file) => {
    if (paths.some((p) => name === p || name.startsWith(p.replace(/\*$/, "")))) {
      matches.push(name);
    }
  });
  for (const name of matches.sort()) {
    const file = zip.file(name);
    if (file && !file.dir) chunks.push(await file.async("string"));
  }
  return chunks;
}

async function extractDocx(buf: ArrayBuffer) {
  const parts = await extractZipXml(buf, ["word/document.xml"]);
  if (!parts.length) throw new Error("Could not read this Word file.");
  return stripXml(parts.join("\n"));
}

async function extractPptx(buf: ArrayBuffer) {
  const zip = await JSZip.loadAsync(buf);
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!slides.length) throw new Error("Could not read this PowerPoint file.");
  const pages: string[] = [];
  for (const name of slides) {
    const xml = await zip.file(name)!.async("string");
    pages.push(stripXml(xml));
  }
  return pages.map((t, i) => `Slide ${i + 1}\n${t}`).join("\n\n");
}

async function extractOdt(buf: ArrayBuffer) {
  const parts = await extractZipXml(buf, ["content.xml"]);
  if (!parts.length) throw new Error("Could not read this OpenDocument file.");
  return stripXml(parts.join("\n"));
}

async function extractPdf(buf: ArrayBuffer) {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
  const pages: string[] = [];
  const n = Math.min(doc.numPages, 40);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? String(it.str) : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) pages.push(line);
  }
  if (!pages.length) throw new Error("This PDF has no extractable text (it may be scanned).");
  return pages.join("\n\n");
}

function stripHtml(html: string) {
  return cap(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function stripRtf(rtf: string) {
  return cap(
    rtf
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\'[0-9a-fA-F]{2}/g, " ")
      .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
      .replace(/[{}]/g, "")
      .replace(/\s+\n/g, "\n")
      .trim(),
  );
}

async function readTextFile(file: File) {
  const raw = await file.text();
  const ext = extOf(file.name);
  if (ext === "html" || ext === "htm") return stripHtml(raw);
  if (ext === "rtf") return stripRtf(raw);
  return cap(raw);
}

async function thumbnail(file: File): Promise<string> {
  if (file.type === "image/svg+xml" || extOf(file.name) === "svg") {
    const text = await file.text();
    return `data:image/svg+xml;utf8,${encodeURIComponent(text.slice(0, 80_000))}`;
  }
  const bitmap = await createImageBitmap(file);
  const max = 960;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

export async function ingestFile(file: File): Promise<SourceFile> {
  const id = uid("src");
  const mime = file.type || "application/octet-stream";
  const kind = kindOf(file.name, mime);
  const base = { id, name: file.name, mime, size: file.size, kind, status: "ready" as const };

  if (file.size > MAX_BYTES) {
    return { ...base, status: "error", error: "File is larger than 12 MB." };
  }

  try {
    const ext = extOf(file.name);
    if (kind === "image") {
      const dataUrl = await thumbnail(file);
      return { ...base, dataUrl, text: `(image: ${file.name})` };
    }
    if (ext === "docx") return { ...base, text: cap(await extractDocx(await file.arrayBuffer())) };
    if (ext === "pptx") return { ...base, text: cap(await extractPptx(await file.arrayBuffer())) };
    if (ext === "odt") return { ...base, text: cap(await extractOdt(await file.arrayBuffer())) };
    if (ext === "pdf") return { ...base, text: cap(await extractPdf(await file.arrayBuffer())) };
    if (ext === "doc" || ext === "ppt") {
      return {
        ...base,
        status: "error",
        error: "Save this as .docx or .pptx and upload again.",
      };
    }
    if (kind === "text" || ext === "txt" || ext === "md") {
      return { ...base, text: await readTextFile(file) };
    }
    const asText = await file.text();
    if (asText && !asText.includes("\0")) return { ...base, text: cap(asText) };
    return { ...base, status: "error", error: "This file type is not readable yet." };
  } catch (err) {
    return {
      ...base,
      status: "error",
      error: err instanceof Error ? err.message : "Could not read this file.",
    };
  }
}

export async function ingestFiles(list: FileList | File[], existing: SourceFile[]): Promise<SourceFile[]> {
  const incoming = Array.from(list);
  const room = Math.max(0, MAX_FILES - existing.length);
  const take = incoming.slice(0, room);
  const next: SourceFile[] = [];
  for (const file of take) next.push(await ingestFile(file));
  return [...existing, ...next];
}

export function sourceBrief(prompt: string, sources: SourceFile[]) {
  const ready = sources.filter((s) => s.status === "ready");
  const written = prompt.trim();
  const docs = ready.filter((s) => s.text).map((s) => `--- ${s.name} ---\n${s.text}`);
  if (!written && !docs.length) return "";
  const header = written || "Create a lesson from the attached source materials.";
  if (!docs.length) return header;
  return `${header}\n\nSOURCE MATERIALS (use these as the primary content; organize and teach from them; do not ignore them):\n\n${docs.join("\n\n")}`;
}
