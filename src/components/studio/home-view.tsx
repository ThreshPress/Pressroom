import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "./wordmark";
import { ComposeDesk } from "./compose-desk";
import { usePressStore } from "@/lib/pressroom/store";
import { developBlueprint } from "@/lib/pressroom/ai";
import { sourceBrief } from "@/lib/pressroom/ingest";
import type { SourceFile } from "@/lib/pressroom/types";
import { cn } from "@/lib/utils";

export function HomeView() {
  const navigate = useNavigate();
  const { projects, profiles, createProject, setBlueprint, setActiveProject } = usePressStore();
  const [prompt, setPrompt] = useState("");
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "lsc-math");
  const [busy, setBusy] = useState(false);

  async function develop() {
    const profile = profiles.find((p) => p.id === profileId) ?? profiles[0];
    if (!profile) return;
    const brief = sourceBrief(prompt, sources);
    if (!brief) {
      toast.error("Type a brief or upload a file to compose a lesson.");
      return;
    }
    setBusy(true);
    const name =
      prompt.trim().split(/[.!?]/)[0]?.slice(0, 48) ||
      sources.find((s) => s.status === "ready")?.name.replace(/\.[^.]+$/, "") ||
      "Untitled lesson";
    const readySources = sources.filter((s) => s.status === "ready");
    const id = createProject({ name, prompt: prompt.trim() || brief.slice(0, 280), profileId: profile.id, sources: readySources });
    const result = await developBlueprint({
      data: {
        prompt: brief,
        profile,
        sources: readySources
          .filter((s) => s.text)
          .map((s) => ({ name: s.name, text: s.text ?? "" })),
      },
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      navigate({ to: "/project/$id", params: { id } });
      return;
    }
    setBlueprint(id, result.blueprint);
    usePressStore.getState().updateProject(id, { name: result.blueprint.topic });
    toast.success("Lesson composed. Send it to press.");
    navigate({ to: "/project/$id", params: { id } });
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark />
        <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
          Instructional design studio
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="pb-10 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rust">Create once</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Bring the copy. Press it into any format.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Type a brief, paste a draft, or upload the materials you already have. Pressroom reads them once, then presses presentations, articles, worksheets, organizers, and assessments.
          </p>
          <div className="mt-8">
            <ComposeDesk
              prompt={prompt}
              onPrompt={setPrompt}
              sources={sources}
              onSources={setSources}
              profiles={profiles}
              profileId={profileId}
              onProfile={setProfileId}
              busy={busy}
              onSubmit={() => void develop()}
            />
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium">Teaching profiles</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setProfileId(p.id)}
                className={cn(
                  "rounded-md border bg-card p-4 text-left shadow-[var(--shadow-border)]",
                  profileId === p.id ? "border-ink" : "border-border",
                )}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-rust">{p.gradeBand}</div>
                <div className="mt-1 font-display text-lg font-semibold">{p.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{p.notes}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.traits.slice(0, 3).map((t) => (
                    <span key={t} className="bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium">On the press</h2>
            <span className="text-sm text-muted-foreground">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveProject(p.id);
                  navigate({ to: "/project/$id", params: { id: p.id } });
                }}
                className="rounded-md border border-border bg-card p-4 text-left shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.artifacts.length} material{p.artifacts.length === 1 ? "" : "s"}
                  {(p.sources?.length ?? 0) > 0 ? ` · ${p.sources!.length} source${p.sources!.length === 1 ? "" : "s"}` : ""}
                </div>
                <div className="mt-1 font-display text-xl font-semibold">{p.name}</div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.artifacts.slice(0, 4).map((a) => (
                    <span key={a.id} className="bg-muted px-2 py-0.5 text-[10px]">
                      {a.title}
                    </span>
                  ))}
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                const id = createProject({
                  name: "Untitled lesson",
                  prompt: "",
                  profileId,
                });
                navigate({ to: "/project/$id", params: { id } });
              }}
              className="flex min-h-40 flex-col items-start justify-center rounded-md border border-dashed border-border p-4 text-left text-muted-foreground hover:bg-card"
            >
              <Plus className="size-5" />
              <span className="mt-2 text-sm">New empty project</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
