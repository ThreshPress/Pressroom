export const PAGE_SIZES = {
  widescreen: { w: 1920, h: 1080, label: "16:9 Presentation" },
  letter: { w: 816, h: 1056, label: "US Letter" },
  tabloid: { w: 792, h: 1224, label: "Tabloid / Infographic" },
  square: { w: 1080, h: 1080, label: "Square" },
  poster: { w: 1080, h: 1620, label: "Poster" },
} as const;

export type PageSizeId = keyof typeof PAGE_SIZES;

export type PressCategory =
  | "present"
  | "read"
  | "practice"
  | "assess"
  | "visualize"
  | "publish"
  | "lms";

export type FormatId =
  | "presentation"
  | "visual-lesson"
  | "news-article"
  | "reading"
  | "magazine"
  | "worksheet"
  | "guided-notes"
  | "organizer"
  | "activity"
  | "study-guide"
  | "quiz"
  | "test"
  | "exit-ticket"
  | "infographic"
  | "poster"
  | "reference"
  | "lesson-plan"
  | "teacher-guide"
  | "canvas-page";

export type Appearance = "middle" | "high-school" | "adult";
export type ReadingLevel = "original" | "accessible" | "simplified";

export interface TeachingProfile {
  id: string;
  name: string;
  gradeBand: string;
  appearance: Appearance;
  reading: ReadingLevel;
  notes: string;
  traits: string[];
}

export interface VocabEntry {
  term: string;
  definition: string;
}

export interface Concept {
  name: string;
  summary: string;
}

export interface Example {
  title: string;
  setup: string;
  steps: string[];
  result: string;
}

export interface SequenceBeat {
  phase: string;
  minutes?: number;
  teacher: string;
  student: string;
}

export interface Blueprint {
  topic: string;
  audience: string;
  gradeBand: string;
  drivingQuestion?: string;
  objectives: string[];
  prerequisites: string[];
  vocabulary: VocabEntry[];
  concepts: Concept[];
  examples: Example[];
  sequence: SequenceBeat[];
  guidedPractice: string[];
  independentPractice: string[];
  checks: string[];
  misconceptions: { myth: string; repair: string }[];
  assessment: string;
  differentiation: string[];
  answerNotes: string[];
  sources: { label: string; note: string }[];
}

export type ElementType =
  | "text"
  | "shape"
  | "image"
  | "line"
  | "icon"
  | "table"
  | "question"
  | "callout"
  | "divider";

export type FontRole = "display" | "sans" | "serif";
export type TextAlign = "left" | "center" | "right";
export type ShapeKind =
  | "rect"
  | "round-rect"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon"
  | "arrow-right"
  | "chevron"
  | "speech"
  | "banner";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  z: number;
  locked?: boolean;
  hidden?: boolean;
  name?: string;
  opacity?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  font: FontRole;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
  color: string;
  align: TextAlign;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  fit: "cover" | "contain";
  query?: string;
  credit?: string;
  flipX?: boolean;
  flipY?: boolean;
  brightness?: number;
  contrast?: number;
}

export interface LineElement extends BaseElement {
  type: "line";
  stroke: string;
  strokeWidth: number;
  dashed?: boolean;
}

export interface IconElement extends BaseElement {
  type: "icon";
  icon: string;
  color: string;
}

export interface TableElement extends BaseElement {
  type: "table";
  columns: string[];
  rows: string[][];
  headerFill: string;
  headerColor: string;
  cellColor: string;
  border: string;
}

export interface QuestionChoice {
  id: string;
  text: string;
}

export type QuestionKind = "mcq" | "tf" | "multi" | "fill" | "short" | "matching";

export interface AssessmentItem {
  id: string;
  kind: QuestionKind;
  prompt: string;
  choices?: QuestionChoice[];
  correct?: string | string[];
  points: number;
  feedback?: string;
  objective?: string;
  difficulty?: "easy" | "medium" | "hard";
  wordBank?: string[];
}

export interface QuestionElement extends BaseElement {
  type: "question";
  item: AssessmentItem;
  showKey?: boolean;
}

export interface CalloutElement extends BaseElement {
  type: "callout";
  variant: "note" | "example" | "try" | "key" | "warn";
  kicker: string;
  body: string;
}

export interface DividerElement extends BaseElement {
  type: "divider";
  color: string;
  weight: number;
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | LineElement
  | IconElement
  | TableElement
  | QuestionElement
  | CalloutElement
  | DividerElement;

export interface Page {
  id: string;
  name: string;
  size: PageSizeId;
  background: string;
  elements: CanvasElement[];
  notes?: string;
}

export type SlideLayout =
  | "title"
  | "objectives"
  | "split"
  | "formula"
  | "cards"
  | "example"
  | "check"
  | "quote"
  | "close"
  | "full-visual";

export interface SlideContent {
  layout: SlideLayout;
  kicker?: string;
  title: string;
  body?: string;
  bullets?: string[];
  formula?: { expression: string; caption: string };
  cards?: { title: string; body: string; query?: string }[];
  example?: Example;
  visualQuery?: string;
  visualSrc?: string;
  visualAlt?: string;
  notes?: string;
}

export interface PresentationDoc {
  kind: "presentation" | "visual-lesson";
  template: "modern-classroom" | "minimal" | "editorial" | "visual";
  course: string;
  slides: SlideContent[];
}

export interface ArticleDoc {
  kind: "news-article" | "reading" | "magazine";
  template: "newspaper" | "modern-news" | "magazine" | "journal";
  masthead: string;
  issue?: string;
  headline: string;
  dek: string;
  byline: string;
  dateline: string;
  sections: { heading?: string; paragraphs: string[] }[];
  pullQuote?: string;
  factBox?: { title: string; items: string[] };
  visualQuery?: string;
  visualSrc?: string;
  visualAlt?: string;
  caption?: string;
}

export interface WorksheetSection {
  type: "intro" | "example" | "questions" | "wordbank" | "scenario" | "notes";
  title?: string;
  body?: string;
  items?: AssessmentItem[];
  words?: string[];
  prompt?: string;
  blanks?: string[];
}

export interface WorksheetDoc {
  kind: "worksheet" | "guided-notes" | "activity" | "study-guide" | "reference";
  template: "practice" | "guided" | "visual" | "scenario" | "vocabulary" | "review";
  title: string;
  course: string;
  studentLine?: boolean;
  directions: string;
  sections: WorksheetSection[];
}

export interface OrganizerDoc {
  kind: "organizer";
  template:
    | "cause-effect"
    | "compare"
    | "sequence"
    | "frayer"
    | "concept-map"
    | "main-idea"
    | "kwl";
  title: string;
  subtitle?: string;
  center?: string;
  nodes: { id: string; label: string; detail?: string; role?: string }[];
  edges?: { from: string; to: string; label?: string }[];
}

export interface QuizDoc {
  kind: "quiz" | "test" | "exit-ticket";
  title: string;
  course: string;
  instructions: string;
  items: AssessmentItem[];
  includeKey: boolean;
}

export interface InfographicBand {
  kicker: string;
  title: string;
  body: string;
  stat?: string;
  query?: string;
  src?: string;
}

export interface InfographicDoc {
  kind: "infographic" | "poster";
  title: string;
  subtitle: string;
  kicker?: string;
  bands: InfographicBand[];
  footer?: string;
}

export interface LessonPlanDoc {
  kind: "lesson-plan" | "teacher-guide";
  title: string;
  course: string;
  duration: string;
  objectives: string[];
  materials: string[];
  sequence: SequenceBeat[];
  checks: string[];
  differentiation: string[];
  closure: string;
  notes?: string[];
}

export interface CanvasPageDoc {
  kind: "canvas-page";
  title: string;
  blocks: { heading?: string; html: string }[];
}

export type PressDocument =
  | PresentationDoc
  | ArticleDoc
  | WorksheetDoc
  | OrganizerDoc
  | QuizDoc
  | InfographicDoc
  | LessonPlanDoc
  | CanvasPageDoc;

export interface Artifact {
  id: string;
  format: FormatId;
  title: string;
  createdAt: string;
  adapted?: boolean;
  parentId?: string;
  doc: PressDocument;
  pages: Page[];
}

export interface SourceFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: "text" | "document" | "slides" | "image" | "other";
  text?: string;
  dataUrl?: string;
  status: "ready" | "error";
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  blueprint: Blueprint | null;
  artifacts: Artifact[];
  activeArtifactId: string | null;
  favorites: string[];
  sources?: SourceFile[];
}

export interface VisualHit {
  id: string;
  src: string;
  thumb?: string;
  alt: string;
  credit?: string;
  license?: string;
  query?: string;
}
