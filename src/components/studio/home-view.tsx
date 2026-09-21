import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "./wordmark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePressStore } from "@/lib/pressroom/store";
import { developBlueprint } from "@/lib/pressroom/ai";
import { cn } from "@/lib/utils";

const SAMPLE =
  "Create a lesson for grades 9–11 about sales tax. Explain what sales tax is, how it is calculated, why rates vary, how rates are determined, where the money goes, and how students encounter sales tax in everyday life.";

export function HomeView() {
  const navigate = useNavigate();
  const { projects, profiles, createProject, setBlueprint, setActiveProject } = usePressStore();
  const [prompt, setPrompt] = useState("");
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "lsc-math");
  const [busy, setBusy] = useState(false);

  async function develop() {
    const text = prompt.trim() || SAMPLE;
    const profile = profiles.find((p) => p.id === profileId) ?? profiles[0];
    if (!profile) return;
    setBusy(true);
    const name = text.split(/[.!?]/)[0]?.slice(0, 48) || "Untitled lesson";
    const id = createProject({ name, prompt: text, profileId: profile.id });
    const result = await developBlueprint({ data: { prompt: text, profile } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      navigate({ to: "/project/$id", params: { id } });
      return;
    }
    setBlueprint(id, result.blueprint);
    usePressStore.getState().updateProject(id, { name: result.blueprint.topic });
    toast.success("Blueprint ready. Send it to press.");
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
        <section className="grid gap-10 pb-16 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rust">Create once</p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Press it into any format.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Develop the instructional blueprint first. Then press a presentation, a news article, a worksheet, an organizer, a quiz — without rewriting the lesson.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What should we teach?
            </label>
            <Textarea
              className="mt-2 min-h-32 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              placeholder={SAMPLE}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                aria-label="Teaching profile"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button onClick={() => void develop()} disabled={busy} className="min-w-40">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                Develop lesson
              </Button>
            </div>
            <button
              className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setPrompt(SAMPLE)}
            >
              Use the sales tax brief
            </button>
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
                  "rounded-xl border bg-card p-4 text-left shadow-[var(--shadow-border)]",
                  profileId === p.id ? "border-ink" : "border-border",
                )}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-rust">{p.gradeBand}</div>
                <div className="mt-1 font-display text-lg font-semibold">{p.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{p.notes}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.traits.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
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
            <span className="text-sm text-muted-foreground">{projects.length} project{projects.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveProject(p.id);
                  navigate({ to: "/project/$id", params: { id: p.id } });
                }}
                className="rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.artifacts.length} material{p.artifacts.length === 1 ? "" : "s"}
                </div>
                <div className="mt-1 font-display text-xl font-semibold">{p.name}</div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.artifacts.slice(0, 4).map((a) => (
                    <span key={a.id} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
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
              className="flex min-h-40 flex-col items-start justify-center rounded-xl border border-dashed border-border p-4 text-left text-muted-foreground hover:bg-card"
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
