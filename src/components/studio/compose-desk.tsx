import { useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPT, ingestFiles } from "@/lib/pressroom/ingest";
import type { SourceFile, TeachingProfile } from "@/lib/pressroom/types";
import { cn } from "@/lib/utils";

export function ComposeDesk({
  prompt,
  onPrompt,
  sources,
  onSources,
  profiles,
  profileId,
  onProfile,
  busy,
  onSubmit,
  submitLabel = "Compose lesson",
}: {
  prompt: string;
  onPrompt: (v: string) => void;
  sources: SourceFile[];
  onSources: (files: SourceFile[]) => void;
  profiles: TeachingProfile[];
  profileId: string;
  onProfile: (id: string) => void;
  busy: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [reading, setReading] = useState(false);

  const canSubmit = Boolean(prompt.trim() || sources.some((s) => s.status === "ready")) && !busy && !reading;

  async function addFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    setReading(true);
    try {
      onSources(await ingestFiles(list, sources));
    } finally {
      setReading(false);
    }
  }

  return (
    <div
      className={cn(
        "border border-border bg-card shadow-[var(--shadow-border)]",
        over && "ring-2 ring-ink/20",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void addFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rust">Manuscript</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Type a brief, paste existing copy, or upload materials.</p>
        </div>
        <span className="hidden text-[11px] uppercase tracking-wider text-muted-foreground sm:inline">
          Copy desk
        </span>
      </div>

      <Textarea
        className="min-h-40 rounded-none border-0 bg-transparent px-4 py-4 text-base leading-relaxed shadow-none focus-visible:ring-0 sm:min-h-48 sm:px-5"
        placeholder="What should students learn? Paste a lesson plan, article, notes, or write a brief — for example: a grade 9–11 lesson on sales tax, how it is calculated, why rates vary, and where the money goes."
        value={prompt}
        onChange={(e) => onPrompt(e.target.value)}
        aria-label="Lesson brief"
      />

      {sources.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5">
          {sources.map((file) => (
            <li
              key={file.id}
              className={cn(
                "flex max-w-full items-center gap-2 border border-border bg-background px-2 py-1.5 text-sm",
                file.status === "error" && "border-destructive/40 text-destructive",
              )}
            >
              {file.dataUrl ? (
                <img src={file.dataUrl} alt="" className="size-8 object-cover" />
              ) : (
                <FileUp className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 truncate">
                {file.name}
                {file.status === "error" ? ` — ${file.error}` : ""}
              </span>
              <button
                type="button"
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${file.name}`}
                onClick={() => onSources(sources.filter((s) => s.id !== file.id))}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPT}
          multiple
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-rule px-3 text-sm text-muted-foreground hover:border-ink hover:bg-muted hover:text-foreground"
        >
          {reading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          {reading ? "Reading files…" : "Upload PDF, Word, slides, text, or images"}
        </button>
        <select
          className="h-11 min-w-0 flex-1 border border-border bg-background px-3 text-sm"
          value={profileId}
          onChange={(e) => onProfile(e.target.value)}
          aria-label="Teaching profile"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button onClick={onSubmit} disabled={!canSubmit} variant="press" className="h-11 min-w-44">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Composing…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
