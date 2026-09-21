import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Loader2,
  Minus,
  Plus,
  Printer,
  Redo2,
  Undo2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "@/components/studio/wordmark";
import { ComposeDesk } from "@/components/studio/compose-desk";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PressDialog } from "@/components/press/press-dialog";
import { LeftRail } from "./left-rail";
import { RightPanel } from "./right-panel";
import { PageCanvas } from "./page-canvas";
import { VisualFinder } from "./visual-finder";
import { AdaptDialog } from "./adapt-dialog";
import {
  activeArtifact,
  usePressStore,
} from "@/lib/pressroom/store";
import { artifactFromDoc, recompileArtifact } from "@/lib/pressroom/compile";
import { formatMeta } from "@/lib/pressroom/formats";
import { adaptDocument, askPressroom, pressDocument, developBlueprint } from "@/lib/pressroom/ai";
import { sourceBrief } from "@/lib/pressroom/ingest";
import { buildQtiZip, collectQuizDoc } from "@/lib/pressroom/qti";
import { canvasPageHtml } from "@/lib/pressroom/export-html";
import { PAGE_SIZES, type CanvasElement, type FormatId, type Page, type SourceFile } from "@/lib/pressroom/types";
import { uid, downloadBlob, downloadText, cn } from "@/lib/utils";
import { C } from "@/lib/pressroom/palette";

export function Workspace({ projectId }: { projectId: string }) {
  const store = usePressStore();
  const project = store.projects.find((p) => p.id === projectId);
  const artifact = project ? activeArtifact({ ...store, activeProjectId: projectId }) : undefined;
  const page = artifact
    ? artifact.pages.find((p) => p.id === store.selectedPageId) ?? artifact.pages[0]
    : undefined;
  const profile = store.profiles.find((p) => p.id === project?.profileId) ?? store.profiles[0];

  const [pressOpen, setPressOpen] = useState(false);
  const [repress, setRepress] = useState(false);
  const [adaptOpen, setAdaptOpen] = useState(false);
  const [busyFormat, setBusyFormat] = useState<FormatId | null>(null);
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [mobilePane, setMobilePane] = useState<"none" | "left" | "right">("none");
  const [finderOpen, setFinderOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = usePressStore.getState();
    if (s.projects.some((p) => p.id === projectId) && s.activeProjectId !== projectId) {
      s.setActiveProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !page) return;
    const pageSize = PAGE_SIZES[page.size];
    const pad = 72;
    const next = Math.max(
      0.12,
      Math.min((el.clientWidth - pad) / pageSize.w, (el.clientHeight - pad) / pageSize.h, 1),
    );
    const cur = usePressStore.getState().zoom;
    if (Math.abs(cur - next) > 0.02) usePressStore.getState().setZoom(next);
  }, [page?.id, page?.size]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      }
      if (meta && e.key === "d" && store.selectedIds.length && artifact && page) {
        e.preventDefault();
        store.duplicateElements(projectId, artifact.id, page.id, store.selectedIds);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && store.selectedIds.length && artifact && page) {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
        e.preventDefault();
        store.removeElements(projectId, artifact.id, page.id, store.selectedIds);
        store.selectElements([]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, projectId, artifact, page]);

  const selected = useMemo(
    () => page?.elements.find((e) => e.id === store.selectedIds[0]),
    [page, store.selectedIds],
  );

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl">Project not found</p>
          <Link to="/" className="mt-3 inline-block text-sm text-rust">
            Back to the studio
          </Link>
        </div>
      </div>
    );
  }

  async function runPress(format: FormatId) {
    if (!project?.blueprint || !profile) {
      toast.error("Compose the lesson before sending to press.");
      return;
    }
    setBusyFormat(format);
    const sourceHint = repress && artifact ? `Repress from existing ${artifact.format} titled ${artifact.title}. Preserve the instructional content; change the rhetoric for the new medium.` : undefined;
    const result = await pressDocument({
      data: { format, blueprint: project.blueprint, profile, sourceHint },
    });
    setBusyFormat(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const art = artifactFromDoc(format, formatMeta(format).label, result.doc);
    store.addArtifact(projectId, art);
    setPressOpen(false);
    toast.success(`Pressed as ${formatMeta(format).label}`);
  }

  async function runAsk(instruction: string) {
    if (!artifact || !profile) return;
    setAsking(true);
    setMessages((m) => [...m, { role: "user", text: instruction }]);
    store.setRightTab("ask");
    const result = await askPressroom({
      data: {
        instruction,
        profile,
        format: artifact.format,
        doc: artifact.doc,
        pageName: page?.name,
      },
    });
    setAsking(false);
    if (!result.ok) {
      toast.error(result.error);
      setMessages((m) => [...m, { role: "assistant", text: result.error }]);
      return;
    }
    store.replaceArtifact(projectId, recompileArtifact({ ...artifact, doc: result.doc }));
    setMessages((m) => [...m, { role: "assistant", text: result.message }]);
  }

  async function runAdapt(opts: { reading: "original" | "accessible" | "simplified"; supports: string[]; copy: boolean }) {
    if (!artifact || !profile) return;
    const result = await adaptDocument({
      data: { doc: artifact.doc, profile, reading: opts.reading, supports: opts.supports },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (opts.copy) {
      const art = artifactFromDoc(artifact.format, `${artifact.title} (adapted)`, result.doc, {
        adapted: true,
        parentId: artifact.id,
      });
      store.addArtifact(projectId, art);
    } else {
      store.replaceArtifact(projectId, recompileArtifact({ ...artifact, doc: result.doc, adapted: true }));
    }
    setAdaptOpen(false);
    toast.success("Adapted.");
  }

  function insert(el: CanvasElement) {
    if (!artifact || !page) return;
    store.addElement(projectId, artifact.id, page.id, el);
    store.selectElements([el.id]);
  }

  function addPage() {
    if (!artifact) return;
    const size = artifact.pages[0]?.size ?? "letter";
    const p: Page = {
      id: uid("pg"),
      name: `Page ${artifact.pages.length + 1}`,
      size,
      background: C.paper,
      elements: [],
    };
    store.addPage(projectId, artifact.id, p);
    store.selectPage(p.id);
  }

  async function exportQti() {
    const doc = artifact ? collectQuizDoc(artifact.doc) : null;
    if (!doc) {
      toast.error("QTI export is for quizzes, tests, and exit tickets.");
      return;
    }
    const blob = await buildQtiZip(doc);
    downloadBlob(blob, `${doc.title.replace(/\s+/g, "-")}-qti.zip`);
    toast.success("QTI package downloaded.");
  }

  function exportHtml() {
    if (!artifact) return;
    downloadText(canvasPageHtml(artifact), `${artifact.title.replace(/\s+/g, "-")}.html`, "text/html");
    toast.success("Canvas HTML downloaded.");
  }

  async function copyHtml() {
    if (!artifact) return;
    await navigator.clipboard.writeText(canvasPageHtml(artifact));
    toast.success("Canvas HTML copied.");
  }

  const rail = (
    <LeftRail
      tab={store.leftTab}
      onTab={store.setLeftTab}
      artifact={artifact}
      selectedPageId={page?.id ?? null}
      onSelectPage={(id) => store.selectPage(id)}
      onAddPage={addPage}
      blueprint={project.blueprint}
      sources={project.sources}
      onInsert={insert}
    />
  );
  const right = (
    <RightPanel
      tab={store.rightTab}
      onTab={store.setRightTab}
      selected={selected}
      onChange={(patch) => {
        if (!artifact || !page || !selected) return;
        store.updateElement(projectId, artifact.id, page.id, selected.id, patch);
      }}
      onAsk={runAsk}
      asking={asking}
      messages={messages}
      onLayer={(dir) => {
        if (!artifact || !page || !selected) return;
        store.restack(projectId, artifact.id, page.id, selected.id, dir);
      }}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="no-print flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-2 sm:px-3">
        <Link to="/" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">
            <Wordmark compact />
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <input
            className="w-full truncate bg-transparent font-display text-sm font-semibold outline-none sm:text-base"
            value={project.name}
            onChange={(e) => store.updateProject(projectId, { name: e.target.value })}
          />
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <Button size="icon-sm" variant="ghost" onClick={store.undo} aria-label="Undo">
            <Undo2 />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={store.redo} aria-label="Redo">
            <Redo2 />
          </Button>
        </div>
        <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => setAdaptOpen(true)}>
          <Wand2 className="size-3.5" /> Adapt
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Download className="size-3.5" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Publish</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print / PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyHtml}>Copy Canvas HTML</DropdownMenuItem>
            <DropdownMenuItem onClick={exportHtml}>Download HTML</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportQti}>QTI ZIP</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRepress(true);
            setPressOpen(true);
          }}
        >
          Repress
        </Button>
        <Button
          size="sm"
          variant="press"
          onClick={() => {
            setRepress(false);
            setPressOpen(true);
          }}
        >
          Send to Press
        </Button>
      </header>

      {project.artifacts.length > 0 && (
        <div className="no-print flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-1.5">
          {project.artifacts.map((a) => (
            <button
              key={a.id}
              onClick={() => store.setActiveArtifact(projectId, a.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs",
                a.id === artifact?.id ? "bg-ink text-paper" : "bg-muted text-muted-foreground",
              )}
            >
              {a.title}
              {a.adapted ? " · adapted" : ""}
            </button>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="hidden h-full lg:flex">{rail}</div>
        <div ref={stageRef} className="press-canvas relative min-w-0 flex-1 overflow-hidden">
          <div className="no-print absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-card/95 p-1 lg:hidden">
            <Button size="sm" variant="ghost" onClick={() => setMobilePane("left")}>
              Pages
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMobilePane("right")}>
              Ask
            </Button>
          </div>
          <div className="no-print absolute right-3 top-3 z-10 hidden items-center gap-1 rounded-md border border-border bg-card/95 p-1 sm:flex">
            <Button size="icon-sm" variant="ghost" onClick={() => store.setZoom(Math.max(0.2, store.zoom - 0.05))}>
              <Minus />
            </Button>
            <span className="w-10 text-center text-xs tabular-nums">{Math.round(store.zoom * 100)}%</span>
            <Button size="icon-sm" variant="ghost" onClick={() => store.setZoom(Math.min(1.4, store.zoom + 0.05))}>
              <Plus />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFinderOpen(true)}>
              Visuals
            </Button>
          </div>
          <div
            className="flex min-h-full items-start justify-center p-6 pt-16 sm:p-10"
            style={{ width: "100%" }}
          >
            {page && artifact ? (
              <div id="print-root">
                <PageCanvas
                  page={page}
                  selectedIds={store.selectedIds}
                  zoom={store.zoom}
                  interactive
                  onSelect={(ids) => store.selectElements(ids)}
                  onChange={(id, patch) => store.updateElement(projectId, artifact.id, page.id, id, patch)}
                />
              </div>
            ) : (
              <EmptyPress
                projectId={projectId}
                hasBlueprint={!!project.blueprint}
                onPress={() => setPressOpen(true)}
              />
            )}
          </div>
        </div>
        <div className="hidden h-full xl:flex">{right}</div>
      </div>

      <Sheet open={mobilePane === "left"} onOpenChange={(o) => !o && setMobilePane("none")}>
        <SheetContent side="left" className="p-0">
          {rail}
        </SheetContent>
      </Sheet>
      <Sheet open={mobilePane === "right"} onOpenChange={(o) => !o && setMobilePane("none")}>
        <SheetContent side="right" className="p-0">
          {right}
        </SheetContent>
      </Sheet>

      <PressDialog
        open={pressOpen}
        onOpenChange={setPressOpen}
        title={repress ? "Repress" : "Send to Press"}
        topic={project.blueprint?.topic}
        objectives={project.blueprint?.objectives}
        existing={project.artifacts.map((a) => a.format)}
        busy={busyFormat}
        onChoose={runPress}
      />
      <AdaptDialog open={adaptOpen} onOpenChange={setAdaptOpen} onAdapt={runAdapt} />
      <VisualFinder
        open={finderOpen}
        onOpenChange={setFinderOpen}
        page={page}
        onInsert={insert}
        onReplace={(src, alt, credit) => {
          if (!artifact || !page || selected?.type !== "image") {
            insert({
              id: uid("el"),
              type: "image",
              x: 80,
              y: 80,
              w: 640,
              h: 360,
              z: 40,
              src,
              alt,
              fit: "cover",
              credit,
            });
            return;
          }
          store.updateElement(projectId, artifact.id, page.id, selected.id, { src, alt, credit });
        }}
      />
      {busyFormat && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-[var(--shadow-border)]">
            <Loader2 className="size-4 animate-spin" /> Pressing {formatMeta(busyFormat).label}…
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyPress({
  onPress,
  hasBlueprint,
  projectId,
}: {
  onPress: () => void;
  hasBlueprint: boolean;
  projectId: string;
}) {
  const store = usePressStore();
  const project = store.projects.find((p) => p.id === projectId);
  const profile = store.profiles.find((p) => p.id === project?.profileId) ?? store.profiles[0];
  const [prompt, setPrompt] = useState(project?.prompt ?? "");
  const [sources, setSources] = useState<SourceFile[]>(project?.sources ?? []);
  const [profileId, setProfileId] = useState(project?.profileId ?? profile?.id ?? "");
  const [busy, setBusy] = useState(false);

  async function compose() {
    if (!project || !profile) return;
    const brief = sourceBrief(prompt, sources);
    if (!brief) {
      toast.error("Type a brief or upload a file to compose a lesson.");
      return;
    }
    const ready = sources.filter((s) => s.status === "ready");
    setBusy(true);
    store.updateProject(projectId, { prompt: prompt.trim() || brief.slice(0, 280), profileId, sources: ready });
    const result = await developBlueprint({
      data: {
        prompt: brief,
        profile: store.profiles.find((p) => p.id === profileId) ?? profile,
        sources: ready.filter((s) => s.text).map((s) => ({ name: s.name, text: s.text ?? "" })),
      },
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    store.setBlueprint(projectId, result.blueprint);
    store.updateProject(projectId, { name: result.blueprint.topic });
    toast.success("Lesson composed. Send it to press.");
  }

  if (hasBlueprint) {
    return (
      <div className="max-w-md py-24 text-center">
        <p className="font-display text-3xl">Ready for press</p>
        <p className="mt-3 text-muted-foreground">
          The lesson is composed. Send it to press as a presentation, article, worksheet, organizer, or quiz.
        </p>
        <Button className="mt-6" variant="press" onClick={onPress}>
          Send to Press
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl py-8">
      <p className="font-display text-3xl">Compose the lesson</p>
      <p className="mt-2 mb-6 text-muted-foreground">
        Type a brief or upload the materials you already have. Pressroom will read them, then you send the result to press.
      </p>
      <ComposeDesk
        prompt={prompt}
        onPrompt={setPrompt}
        sources={sources}
        onSources={setSources}
        profiles={store.profiles}
        profileId={profileId}
        onProfile={setProfileId}
        busy={busy}
        onSubmit={() => void compose()}
      />
    </div>
  );
}
