import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type {
  Artifact,
  Blueprint,
  CanvasElement,
  Page,
  Project,
  TeachingProfile,
} from "./types";
import { PROFILES, buildSalesTaxProject } from "./seed";

const MAX_HISTORY = 40;

type Snapshot = {
  projects: Project[];
  profiles: TeachingProfile[];
};

interface PressState {
  hydrated: boolean;
  profiles: TeachingProfile[];
  projects: Project[];
  activeProjectId: string | null;
  selectedPageId: string | null;
  selectedIds: string[];
  leftTab: "pages" | "elements" | "visuals" | "blueprint";
  rightTab: "properties" | "ask";
  zoom: number;
  past: Snapshot[];
  future: Snapshot[];
  markHydrated: () => void;
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  setLeftTab: (t: PressState["leftTab"]) => void;
  setRightTab: (t: PressState["rightTab"]) => void;
  setZoom: (z: number) => void;
  setActiveProject: (id: string | null) => void;
  selectPage: (id: string | null) => void;
  selectElements: (ids: string[]) => void;
  upsertProfile: (p: TeachingProfile) => void;
  createProject: (input: { name: string; prompt: string; profileId: string }) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setBlueprint: (projectId: string, blueprint: Blueprint) => void;
  addArtifact: (projectId: string, artifact: Artifact) => void;
  replaceArtifact: (projectId: string, artifact: Artifact) => void;
  setActiveArtifact: (projectId: string, artifactId: string) => void;
  updatePage: (projectId: string, artifactId: string, pageId: string, patch: Partial<Page>) => void;
  addPage: (projectId: string, artifactId: string, page: Page) => void;
  removePage: (projectId: string, artifactId: string, pageId: string) => void;
  updateElement: (
    projectId: string,
    artifactId: string,
    pageId: string,
    elementId: string,
    patch: Partial<CanvasElement>,
  ) => void;
  addElement: (projectId: string, artifactId: string, pageId: string, el: CanvasElement) => void;
  removeElements: (projectId: string, artifactId: string, pageId: string, ids: string[]) => void;
  duplicateElements: (projectId: string, artifactId: string, pageId: string, ids: string[]) => void;
  restack: (
    projectId: string,
    artifactId: string,
    pageId: string,
    id: string,
    dir: "front" | "back" | "forward" | "backward",
  ) => void;
}

function snap(state: PressState): Snapshot {
  return {
    projects: structuredClone(state.projects),
    profiles: structuredClone(state.profiles),
  };
}

function mutate(set: (fn: (s: PressState) => Partial<PressState>) => void, updater: (s: PressState) => void) {
  set((s) => {
    const past = [...s.past, snap(s)].slice(-MAX_HISTORY);
    const next = { ...s, projects: structuredClone(s.projects), profiles: structuredClone(s.profiles), past, future: [] };
    updater(next);
    return next;
  });
}

function findArtifact(projects: Project[], projectId: string, artifactId: string) {
  const project = projects.find((p) => p.id === projectId);
  const artifact = project?.artifacts.find((a) => a.id === artifactId);
  return { project, artifact };
}

const seed = buildSalesTaxProject();

export const usePressStore = create<PressState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profiles: PROFILES,
      projects: [seed],
      activeProjectId: seed.id,
      selectedPageId: seed.artifacts[0]?.pages[0]?.id ?? null,
      selectedIds: [],
      leftTab: "pages",
      rightTab: "properties",
      zoom: 0.42,
      past: [],
      future: [],
      markHydrated: () => set({ hydrated: true }),
      snapshot: () => set((s) => ({ past: [...s.past, snap(s)].slice(-MAX_HISTORY), future: [] })),
      undo: () => {
        const s = get();
        const prev = s.past[s.past.length - 1];
        if (!prev) return;
        set({
          projects: prev.projects,
          profiles: prev.profiles,
          past: s.past.slice(0, -1),
          future: [snap(s), ...s.future].slice(0, MAX_HISTORY),
        });
      },
      redo: () => {
        const s = get();
        const next = s.future[0];
        if (!next) return;
        set({
          projects: next.projects,
          profiles: next.profiles,
          future: s.future.slice(1),
          past: [...s.past, snap(s)].slice(-MAX_HISTORY),
        });
      },
      setLeftTab: (leftTab) => set({ leftTab }),
      setRightTab: (rightTab) => set({ rightTab }),
      setZoom: (zoom) => set({ zoom }),
      setActiveProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        const art = project?.artifacts.find((a) => a.id === project.activeArtifactId) ?? project?.artifacts[0];
        set({
          activeProjectId: id,
          selectedPageId: art?.pages[0]?.id ?? null,
          selectedIds: [],
        });
      },
      selectPage: (id) => set({ selectedPageId: id, selectedIds: [] }),
      selectElements: (ids) => set({ selectedIds: ids }),
      upsertProfile: (p) =>
        set((s) => ({
          profiles: s.profiles.some((x) => x.id === p.id)
            ? s.profiles.map((x) => (x.id === p.id ? p : x))
            : [...s.profiles, p],
        })),
      createProject: (input) => {
        const id = uid("prj");
        const project: Project = {
          id,
          name: input.name,
          prompt: input.prompt,
          profileId: input.profileId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blueprint: null,
          artifacts: [],
          activeArtifactId: null,
          favorites: [],
        };
        set((s) => ({
          projects: [project, ...s.projects],
          activeProjectId: id,
          selectedPageId: null,
          selectedIds: [],
        }));
        return id;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? (s.projects.find((p) => p.id !== id)?.id ?? null) : s.activeProjectId,
        })),
      setBlueprint: (projectId, blueprint) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, blueprint, updatedAt: new Date().toISOString() } : p,
          ),
        })),
      addArtifact: (projectId, artifact) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  artifacts: [...p.artifacts, artifact],
                  activeArtifactId: artifact.id,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
          selectedPageId: artifact.pages[0]?.id ?? null,
          selectedIds: [],
        })),
      replaceArtifact: (projectId, artifact) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  artifacts: p.artifacts.map((a) => (a.id === artifact.id ? artifact : a)),
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),
      setActiveArtifact: (projectId, artifactId) => {
        const { artifact } = findArtifact(get().projects, projectId, artifactId);
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, activeArtifactId: artifactId } : p,
          ),
          selectedPageId: artifact?.pages[0]?.id ?? null,
          selectedIds: [],
        }));
      },
      updatePage: (projectId, artifactId, pageId, patch) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          if (!artifact) return;
          artifact.pages = artifact.pages.map((pg) => (pg.id === pageId ? { ...pg, ...patch } : pg));
        }),
      addPage: (projectId, artifactId, page) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          if (!artifact) return;
          artifact.pages = [...artifact.pages, page];
        }),
      removePage: (projectId, artifactId, pageId) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          if (!artifact) return;
          artifact.pages = artifact.pages.filter((p) => p.id !== pageId);
        }),
      updateElement: (projectId, artifactId, pageId, elementId, patch) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          const page = artifact?.pages.find((p) => p.id === pageId);
          if (!page) return;
          page.elements = page.elements.map((el) => (el.id === elementId ? ({ ...el, ...patch } as CanvasElement) : el));
        }),
      addElement: (projectId, artifactId, pageId, el) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          const page = artifact?.pages.find((p) => p.id === pageId);
          if (!page) return;
          const z = page.elements.reduce((m, e) => Math.max(m, e.z), 0) + 1;
          page.elements = [...page.elements, { ...el, z }];
        }),
      removeElements: (projectId, artifactId, pageId, ids) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          const page = artifact?.pages.find((p) => p.id === pageId);
          if (!page) return;
          page.elements = page.elements.filter((e) => !ids.includes(e.id));
        }),
      duplicateElements: (projectId, artifactId, pageId, ids) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          const page = artifact?.pages.find((p) => p.id === pageId);
          if (!page) return;
          const copies = page.elements
            .filter((e) => ids.includes(e.id))
            .map((e) => ({ ...structuredClone(e), id: uid("el"), x: e.x + 16, y: e.y + 16, z: e.z + 1 }));
          page.elements = [...page.elements, ...copies];
        }),
      restack: (projectId, artifactId, pageId, id, dir) =>
        mutate(set, (s) => {
          const { artifact } = findArtifact(s.projects, projectId, artifactId);
          const page = artifact?.pages.find((p) => p.id === pageId);
          if (!page) return;
          const zs = page.elements.map((e) => e.z);
          const el = page.elements.find((e) => e.id === id);
          if (!el) return;
          const min = Math.min(...zs);
          const max = Math.max(...zs);
          if (dir === "front") el.z = max + 1;
          if (dir === "back") el.z = min - 1;
          if (dir === "forward") el.z += 1;
          if (dir === "backward") el.z -= 1;
        }),
    }),
    {
      name: "pressroom.v3",
      skipHydration: true,
      partialize: (s) => ({
        profiles: s.profiles,
        projects: s.projects,
        activeProjectId: s.activeProjectId,
      }),
    },
  ),
);

export function activeProject(state: PressState): Project | undefined {
  return state.projects.find((p) => p.id === state.activeProjectId);
}

export function activeArtifact(state: PressState): Artifact | undefined {
  const p = activeProject(state);
  if (!p) return undefined;
  return p.artifacts.find((a) => a.id === p.activeArtifactId) ?? p.artifacts[0];
}

export function activePage(state: PressState): Page | undefined {
  const a = activeArtifact(state);
  if (!a) return undefined;
  return a.pages.find((p) => p.id === state.selectedPageId) ?? a.pages[0];
}
