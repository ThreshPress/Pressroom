export interface LibraryItem {
  id: string;
  label: string;
  collection: string;
  kind: "shape" | "icon" | "text";
  shape?: string;
  icon?: string;
  sample?: string;
}

export const COLLECTIONS = [
  "Education",
  "Math",
  "Science",
  "Civics",
  "Money",
  "Arrows & Processes",
  "Charts & Data",
  "Frames",
] as const;

export const LIBRARY: LibraryItem[] = [
  { id: "rect", label: "Rectangle", collection: "Frames", kind: "shape", shape: "rect" },
  { id: "round", label: "Rounded rectangle", collection: "Frames", kind: "shape", shape: "round-rect" },
  { id: "ellipse", label: "Ellipse", collection: "Frames", kind: "shape", shape: "ellipse" },
  { id: "diamond", label: "Diamond", collection: "Frames", kind: "shape", shape: "diamond" },
  { id: "triangle", label: "Triangle", collection: "Frames", kind: "shape", shape: "triangle" },
  { id: "hex", label: "Hexagon", collection: "Frames", kind: "shape", shape: "hexagon" },
  { id: "banner", label: "Banner", collection: "Frames", kind: "shape", shape: "banner" },
  { id: "speech", label: "Speech", collection: "Frames", kind: "shape", shape: "speech" },
  { id: "chevron", label: "Chevron", collection: "Arrows & Processes", kind: "shape", shape: "chevron" },
  { id: "arrow", label: "Arrow", collection: "Arrows & Processes", kind: "shape", shape: "arrow-right" },
  { id: "heading", label: "Heading", collection: "Education", kind: "text", sample: "Heading" },
  { id: "body", label: "Body text", collection: "Education", kind: "text", sample: "Body text for the lesson." },
  { id: "kicker", label: "Kicker", collection: "Education", kind: "text", sample: "KICKER" },
  { id: "icon-book", label: "Book", collection: "Education", kind: "icon", icon: "BookOpen" },
  { id: "icon-school", label: "School", collection: "Education", kind: "icon", icon: "School" },
  { id: "icon-pencil", label: "Pencil", collection: "Education", kind: "icon", icon: "Pencil" },
  { id: "icon-clipboard", label: "Clipboard", collection: "Education", kind: "icon", icon: "ClipboardList" },
  { id: "icon-percent", label: "Percent", collection: "Math", kind: "icon", icon: "Percent" },
  { id: "icon-calc", label: "Calculator", collection: "Math", kind: "icon", icon: "Calculator" },
  { id: "icon-sigma", label: "Formula", collection: "Math", kind: "icon", icon: "Sigma" },
  { id: "icon-hash", label: "Number", collection: "Math", kind: "icon", icon: "Hash" },
  { id: "icon-flask", label: "Flask", collection: "Science", kind: "icon", icon: "FlaskConical" },
  { id: "icon-atom", label: "Atom", collection: "Science", kind: "icon", icon: "Atom" },
  { id: "icon-leaf", label: "Leaf", collection: "Science", kind: "icon", icon: "Leaf" },
  { id: "icon-landmark", label: "Landmark", collection: "Civics", kind: "icon", icon: "Landmark" },
  { id: "icon-scale", label: "Scale", collection: "Civics", kind: "icon", icon: "Scale" },
  { id: "icon-flag", label: "Flag", collection: "Civics", kind: "icon", icon: "Flag" },
  { id: "icon-map", label: "Map", collection: "Civics", kind: "icon", icon: "Map" },
  { id: "icon-banknote", label: "Banknote", collection: "Money", kind: "icon", icon: "Banknote" },
  { id: "icon-coins", label: "Coins", collection: "Money", kind: "icon", icon: "Coins" },
  { id: "icon-receipt", label: "Receipt", collection: "Money", kind: "icon", icon: "Receipt" },
  { id: "icon-wallet", label: "Wallet", collection: "Money", kind: "icon", icon: "Wallet" },
  { id: "icon-arrow-right", label: "Arrow right", collection: "Arrows & Processes", kind: "icon", icon: "ArrowRight" },
  { id: "icon-arrow-down", label: "Arrow down", collection: "Arrows & Processes", kind: "icon", icon: "ArrowDown" },
  { id: "icon-repeat", label: "Cycle", collection: "Arrows & Processes", kind: "icon", icon: "Repeat" },
  { id: "icon-git", label: "Branch", collection: "Arrows & Processes", kind: "icon", icon: "GitBranch" },
  { id: "icon-bar", label: "Bar chart", collection: "Charts & Data", kind: "icon", icon: "BarChart3" },
  { id: "icon-pie", label: "Pie chart", collection: "Charts & Data", kind: "icon", icon: "PieChart" },
  { id: "icon-line", label: "Line chart", collection: "Charts & Data", kind: "icon", icon: "ChartLine" },
];

export const STOCK = [
  { id: "checkout", src: "/media/checkout.jpg", alt: "Grocery checkout and receipt", query: "checkout receipt" },
  { id: "currency", src: "/media/currency.jpg", alt: "Currency still life", query: "money coins" },
  { id: "school", src: "/media/school.jpg", alt: "Public school building", query: "school building" },
  { id: "fire", src: "/media/fire-station.jpg", alt: "Fire station", query: "fire station" },
  { id: "roads", src: "/media/roads.jpg", alt: "Road and overpass", query: "roads infrastructure" },
  { id: "park", src: "/media/park.jpg", alt: "City park", query: "park bench" },
  { id: "notebook", src: "/media/notebook.jpg", alt: "Notebook and pencil", query: "student notebook" },
];
