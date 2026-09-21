import { artifactFromDoc } from "./compile";
import type {
  ArticleDoc,
  AssessmentItem,
  Blueprint,
  InfographicDoc,
  LessonPlanDoc,
  OrganizerDoc,
  PresentationDoc,
  Project,
  QuizDoc,
  TeachingProfile,
  WorksheetDoc,
} from "./types";

export const PROFILES: TeachingProfile[] = [
  {
    id: "lsc-math",
    name: "LSC Math 9–11",
    gradeBand: "Grades 9–11",
    appearance: "high-school",
    reading: "accessible",
    notes: "Practical mathematics. Real-world applications. Avoid childish presentation.",
    traits: [
      "High-school age appearance",
      "Practical mathematics",
      "Real-world applications",
      "Accessible reading",
      "Visual examples",
      "Functional skills",
    ],
  },
  {
    id: "mod-history",
    name: "Modified World History 10",
    gradeBand: "Grade 10",
    appearance: "high-school",
    reading: "simplified",
    notes: "Preserve the essential learning target. Reduce load, not rigor of the idea.",
    traits: [
      "Shortened text",
      "Chunk information",
      "Reduced question quantity",
      "Two-choice items when appropriate",
      "Chunked word banks",
      "Visual support",
    ],
  },
  {
    id: "hs-general",
    name: "General High School",
    gradeBand: "Grades 9–12",
    appearance: "high-school",
    reading: "original",
    notes: "Clear academic tone. Publisher-quality layouts.",
    traits: ["Age-appropriate", "Clear hierarchy", "Original reading level"],
  },
];

export const SALES_TAX_BLUEPRINT: Blueprint = {
  topic: "Sales tax",
  audience: "High school students in a practical mathematics course",
  gradeBand: "Grades 9–11",
  drivingQuestion: "When a price tag says $40, why do we often pay more — and where does that extra money go?",
  objectives: [
    "Define sales tax as a consumption tax collected at the point of sale.",
    "Calculate sales tax and total cost using Total = Price × (1 + rate).",
    "Explain why combined rates vary by state and locality.",
    "Describe typical public services funded by sales tax revenue.",
    "Identify sales tax on everyday receipts and online checkouts.",
  ],
  prerequisites: [
    "Percent as a rate (7% = 0.07)",
    "Multiplying a decimal by money amounts",
    "Rounding to the nearest cent",
  ],
  vocabulary: [
    { term: "Sales tax", definition: "A tax on goods and some services, added at the time of purchase." },
    { term: "Tax rate", definition: "The percent used to calculate the tax. Often a combined state + local rate." },
    { term: "Taxable amount", definition: "The portion of a purchase that the rate is applied to." },
    { term: "Exemption", definition: "An item or buyer that is not charged sales tax under local law." },
    { term: "Use tax", definition: "A related tax on taxable goods bought out of state and used at home." },
  ],
  concepts: [
    {
      name: "It is a consumption tax",
      summary: "You pay it when you buy, not on income. The seller usually collects it and remits it to the government.",
    },
    {
      name: "The rate is a percent of price",
      summary: "Tax = price × rate. Total = price + tax, or price × (1 + rate).",
    },
    {
      name: "Rates are stacked",
      summary: "A state rate and local rates (city, county, special districts) often combine at the register.",
    },
    {
      name: "The money is earmarked for public work",
      summary: "Revenue typically supports schools, roads, public safety, parks, and general local government.",
    },
  ],
  examples: [
    {
      title: "Headphones on the receipt",
      setup: "A pair of headphones costs $40.00. The combined sales tax rate is 7.25%.",
      steps: [
        "Write the rate as a decimal: 7.25% = 0.0725.",
        "Tax = 40.00 × 0.0725 = 2.90.",
        "Total = 40.00 + 2.90 = $42.90.",
      ],
      result: "The customer pays $42.90. $2.90 is sales tax.",
    },
  ],
  sequence: [
    {
      phase: "Hook",
      minutes: 8,
      teacher: "Show a receipt. Ask why the total is higher than the listed prices.",
      student: "Notice the tax line. Guess what it funds.",
    },
    {
      phase: "Explain",
      minutes: 12,
      teacher: "Define sales tax, rate, and combined jurisdictions.",
      student: "Write the definition and the two formulas.",
    },
    {
      phase: "Worked example",
      minutes: 10,
      teacher: "Model $40 at 7.25% with rounding.",
      student: "Copy the steps. Check the cents.",
    },
    {
      phase: "Guided practice",
      minutes: 12,
      teacher: "Circulate with two more receipts.",
      student: "Calculate tax and total with a partner.",
    },
    {
      phase: "Where the money goes",
      minutes: 10,
      teacher: "Map revenue to local services with visuals.",
      student: "Match services to the tax line on a receipt.",
    },
    {
      phase: "Independent practice / check",
      minutes: 12,
      teacher: "Worksheet then exit ticket.",
      student: "Solve, then explain one everyday encounter.",
    },
  ],
  guidedPractice: [
    "A $16.00 lunch with 8% tax. Find tax and total.",
    "A $120.00 jacket with 6.5% tax. Find tax and total.",
  ],
  independentPractice: [
    "Three mixed receipts, including one with an exempt item labeled.",
    "Given total and rate, work backwards to find the pre-tax price.",
  ],
  checks: [
    "On a mini-whiteboard: tax and total for $25 at 6%.",
    "Verbal: Why might two neighboring towns have different totals for the same $40 item?",
  ],
  misconceptions: [
    {
      myth: "The listed price is always what you pay.",
      repair: "Many posted prices are pre-tax. The receipt shows the tax line.",
    },
    {
      myth: "Sales tax is the same everywhere in the United States.",
      repair: "Five states have no statewide sales tax; local rates still vary. Always use the rate on the receipt.",
    },
    {
      myth: "7% of $40 is $7.",
      repair: "7% is 0.07, not 0.7. Estimate: 10% of $40 is $4, so 7% is a bit less than $4.",
    },
  ],
  assessment: "Short quiz: two calculations, one explanation of rate variation, one item on where revenue goes.",
  differentiation: [
    "Calculator permitted for computation; require the decimal conversion to be written.",
    "Chunked word bank on the adapted worksheet.",
    "Two-choice items on the modified quiz.",
    "Sentence starters for the written explanation.",
  ],
  answerNotes: [
    "Always round tax to the nearest cent unless a problem states otherwise.",
    "Accept equivalent work: tax-then-add or multiply by (1 + rate).",
  ],
  sources: [
    {
      label: "State department of revenue",
      note: "Rates and exemptions are jurisdiction-specific. Do not invent a student's local rate; use examples labeled as examples.",
    },
    {
      label: "Classroom receipts",
      note: "Best primary source: real receipts with the tax line visible.",
    },
  ],
};

const COURSE = "LSC Math  ·  Grades 9–11";

const presentation: PresentationDoc = {
  kind: "presentation",
  template: "modern-classroom",
  course: COURSE,
  slides: [
    {
      layout: "title",
      kicker: COURSE,
      title: "Sales Tax",
      body: "What it is, how it is calculated, why the rate changes, and where the extra money on the receipt actually goes.",
      visualSrc: "/media/checkout.jpg",
      visualAlt: "A grocery checkout with a paper receipt",
      notes: "Open with a real receipt under the document camera if you have one.",
    },
    {
      layout: "objectives",
      kicker: "By the end of this lesson",
      title: "You will be able to",
      bullets: [
        "Define sales tax and find it on a receipt.",
        "Calculate tax and total from a price and a rate.",
        "Explain why two towns can have different totals.",
        "Name public services the revenue typically funds.",
      ],
      body: "This is practical math. You already pay this. The goal is to read the receipt with control, not surprise.",
      notes: "Read the objectives aloud. Ask who has noticed the tax line this week.",
    },
    {
      layout: "split",
      kicker: "Definition",
      title: "What sales tax is",
      bullets: [
        "A consumption tax: you pay it when you buy, not on your paycheck.",
        "Collected by the seller at the register or checkout page.",
        "Remitted to state and local governments.",
        "Usually listed as its own line on the receipt.",
      ],
      visualSrc: "/media/currency.jpg",
      visualAlt: "Currency still life",
      notes: "Contrast with income tax in one sentence. Do not derail into the whole tax code.",
    },
    {
      layout: "formula",
      kicker: "The calculation",
      title: "Two equivalent formulas",
      formula: {
        expression: "Tax = Price × Rate     ·     Total = Price × (1 + Rate)",
        caption: "Write the percent as a decimal first. 7.25% = 0.0725. Round tax to the nearest cent.",
      },
      bullets: [
        "The rate is a percent of the taxable price, not a flat fee.",
        "Combined rate = state rate + local rates stacked together.",
        "If an item is exempt, do not apply the rate to that item.",
      ],
      notes: "Have students write both formulas. Prefer the second for speed once they trust it.",
    },
    {
      layout: "example",
      kicker: "Worked example",
      title: "Headphones, $40.00, 7.25%",
      example: {
        title: "Labeled example — not your local rate",
        setup: "A pair of headphones is marked $40.00. The combined sales tax rate on the receipt is 7.25%.",
        steps: [
          "Convert: 7.25% = 0.0725.",
          "Tax = 40.00 × 0.0725 = 2.90.",
          "Total = 40.00 + 2.90 = 42.90.",
        ],
        result: "Customer pays $42.90.  $2.90 is sales tax.",
      },
      notes: "Estimate first: 10% of $40 is $4, so 7% should land under $4. Catch the 7% = $7 error here.",
    },
    {
      layout: "split",
      kicker: "Jurisdiction",
      title: "Why rates vary",
      bullets: [
        "States set a statewide rate — or choose to have none.",
        "Cities, counties, and special districts may add local rates.",
        "The register uses the location of the sale, not the buyer’s hometown.",
        "Exemptions (groceries, prescriptions) also differ by state.",
      ],
      body: "Do not memorize a national rate. There isn’t one. Read the receipt, or look up the combined rate for that address.",
      notes: "Five states have no statewide sales tax. Mention as a curiosity; don’t turn it into a trivia contest.",
    },
    {
      layout: "cards",
      kicker: "Public finance",
      title: "Where the money goes",
      cards: [
        { title: "Schools", body: "A large share of local tax collections supports public education — buildings, staff, and operations." },
        { title: "Roads", body: "Maintenance, signals, and transit often draw on general sales tax or dedicated local rates." },
        { title: "Safety", body: "Fire, emergency medical, and police budgets are among the services the tax line quietly funds." },
        { title: "Places", body: "Parks, libraries, and general local government are easy to forget until they are gone." },
      ],
      notes: "Pair with the four photographs in Visual Finder if you want to linger.",
    },
    {
      layout: "full-visual",
      kicker: "Everyday life",
      title: "You already meet this tax",
      body: "Grocery lanes. Takeout. Online checkout. Concert tickets. The skill is noticing the tax line before you tap pay.",
      visualSrc: "/media/checkout.jpg",
      visualAlt: "Checkout lane",
      notes: "Ask for two places students paid tax this week. Keep it non-embarrassing — food and phone accessories work.",
    },
    {
      layout: "check",
      kicker: "Check for understanding",
      title: "Try these without rushing",
      bullets: [
        "A $16.00 meal, 8% tax. What is the tax? The total?",
        "Why might the same $40 headphones cost more in the next town?",
        "Name two public services the $2.90 on the headphone receipt could help fund.",
      ],
      notes: "Mini-whiteboards. Cold-call the why, not just the arithmetic.",
    },
    {
      layout: "close",
      kicker: "Keep",
      title: "What to remember",
      bullets: [
        "Sales tax is a percent of the taxable price, collected at purchase.",
        "Convert the percent, multiply, round to the cent, then add — or multiply by (1 + rate).",
        "Rates vary because governments stack them. The receipt is the source of truth.",
        "The extra money is not a store fee. It is public revenue.",
      ],
      body: "Exit ticket is two calculations and one sentence: where does the tax on your last receipt go?",
      notes: "Collect the exit ticket. Tomorrow: work backwards from total to pre-tax price.",
    },
  ],
};

const article: ArticleDoc = {
  kind: "news-article",
  template: "newspaper",
  masthead: "The Civics Ledger",
  issue: "Practical Mathematics  ·  Classroom Edition",
  headline: "The extra dollars at the register are not a mystery",
  dek: "Sales tax is a small line on a receipt and a large part of how towns pay for schools, roads, and emergency services. Here is how to read it.",
  byline: "Pressroom Staff",
  dateline: "Classroom edition",
  visualSrc: "/media/checkout.jpg",
  visualAlt: "A receipt resting on a grocery checkout belt",
  caption: "The tax line sits below the subtotal. That is the amount calculated from the local combined rate.",
  pullQuote: "There is no single American sales-tax rate. The receipt is the document that tells you which one applied.",
  factBox: {
    title: "Keep these straight",
    items: [
      "Tax = price × rate",
      "Total = price × (1 + rate)",
      "Round to the nearest cent",
      "Example only: 7.25% of $40.00 is $2.90",
    ],
  },
  sections: [
    {
      heading: "A tax on buying, not on earning",
      paragraphs: [
        "When a pair of headphones is marked $40, many students are surprised to be charged $42.90. The difference is not a hidden store fee. It is sales tax: a consumption tax collected at the point of sale.",
        "Unlike income tax, sales tax is not taken from a paycheck. It is added when you buy taxable goods and some services. The seller collects it and remits it to the government. On a well-printed receipt, it has its own line.",
      ],
    },
    {
      heading: "How the math works",
      paragraphs: [
        "The rate is a percent of the taxable price. If the combined rate is 7.25%, write 0.0725. Multiply. For $40.00, the tax is $2.90 and the total is $42.90. You can also multiply the price by 1.0725 in one step.",
        "Always round to the nearest cent unless a problem says otherwise. A useful estimate: 10% of $40 is $4, so 7% must land a little under $4 — never $7.",
      ],
    },
    {
      heading: "Why your total changes by town",
      paragraphs: [
        "States set a statewide rate, and some choose to have none. Cities, counties, and special districts may add local rates on top. The register uses the location of the sale. Two stores ten miles apart can legally charge different totals for the same $40 item.",
        "Exemptions vary too. Groceries or prescription medicine may be taxed in one state and spared in another. That is a policy choice, not a glitch in the calculator.",
      ],
    },
    {
      heading: "Where the extra money goes",
      paragraphs: [
        "Sales tax is one of the ways communities pay for shared work: public schools, road maintenance, fire and emergency services, parks, and general local government. The exact split is local. The civic point is not a pie chart to memorize. It is this: the tax line is public revenue, and students already participate in it every time they tap a card at a counter.",
      ],
    },
  ],
};

const worksheet: WorksheetDoc = {
  kind: "worksheet",
  template: "practice",
  title: "Sales tax — practice",
  course: COURSE,
  studentLine: true,
  directions:
    "Show the decimal you used. Round tax to the nearest cent. The 7.25% headphone example in class is a labeled example, not necessarily your city’s rate.",
  sections: [
    {
      type: "example",
      title: "Worked example",
      body: "Headphones $40.00 at 7.25%.  Rate as decimal: 0.0725.  Tax = 40.00 × 0.0725 = $2.90.  Total = $42.90.",
    },
    {
      type: "questions",
      title: "A.  Calculate",
      items: [
        q("w1", "mcq", "A $16.00 meal is taxed at 8%. What is the tax?", ["$1.28", "$8.00", "$1.60", "$0.80"], "A", 1, "16 × 0.08 = 1.28"),
        q("w2", "mcq", "That same $16.00 meal at 8%: what is the total?", ["$16.80", "$17.28", "$24.00", "$16.08"], "B", 1, "16 + 1.28 = 17.28"),
        q("w3", "short", "A jacket costs $120.00. Combined rate 6.5%. Find the tax and the total. Show work.", undefined, "Tax $7.80; total $127.80", 2),
        q("w4", "short", "Estimate first: is 7% of $40 closer to $2.80 or $7.00? Then compute 7% of $40 exactly.", undefined, "Closer to $2.80; exact $2.80", 2),
      ],
    },
    {
      type: "scenario",
      title: "B.  At the register",
      body: "You are buying a $40.00 accessory in a town with a 7.25% combined rate. Your cousin lives one town over, where the combined rate is 8.5%.",
      prompt: "Who pays more, and by how much, if both buy the same item? Explain in two sentences using the word rate.",
    },
    {
      type: "questions",
      title: "C.  Sense-making",
      items: [
        q("w5", "short", "Why is the listed price not always what you pay? Use the word receipt.", undefined, "Many posted prices are pre-tax; the receipt shows the tax line.", 2),
        q("w6", "short", "Name two public services sales tax revenue often helps fund.", undefined, "Any two: schools, roads, fire/EMS, parks, local government.", 2),
      ],
    },
  ],
};

const notes: WorksheetDoc = {
  kind: "guided-notes",
  template: "guided",
  title: "Sales tax — guided notes",
  course: COURSE,
  studentLine: true,
  directions: "Fill each blank as we move through the slides. Use the word bank for Section A only.",
  sections: [
    {
      type: "wordbank",
      title: "A.  Word bank",
      words: ["consumption", "percent", "receipt", "combined", "exempt", "remit"],
    },
    {
      type: "notes",
      title: "B.  The idea",
      blanks: [
        "Sales tax is a ____________ tax: you pay it when you buy, not on a paycheck.",
        "Sellers collect it and ____________ it to the government.",
        "You can usually find it as its own line on the ____________.",
      ],
    },
    {
      type: "notes",
      title: "C.  The math",
      blanks: [
        "The rate is a ____________ of the taxable price.",
        "Tax = Price × Rate.    Total = Price × (1 + Rate).",
        "A 7.25% rate as a decimal is ____________.",
        "Headphones $40.00 at 7.25%: tax = $________    total = $________",
      ],
    },
    {
      type: "notes",
      title: "D.  Variation and use",
      blanks: [
        "A ____________ rate stacks state + local rates.",
        "An ____________ item is not taxed under local law.",
        "Two public services the money may fund: ____________ and ____________.",
      ],
    },
  ],
};

const organizer: OrganizerDoc = {
  kind: "organizer",
  template: "concept-map",
  title: "Sales tax — from the receipt to the town",
  subtitle: "Write a short note in each box. The center is the tax line on a receipt.",
  center: "Sales tax collected",
  nodes: [
    { id: "n1", label: "What it is", detail: "A consumption tax added at purchase.", role: "idea" },
    { id: "n2", label: "How it is calculated", detail: "Price × rate, rounded to the cent.", role: "idea" },
    { id: "n3", label: "Why rates differ", detail: "State + local rates stack by location.", role: "idea" },
    { id: "n4", label: "Schools", detail: "Education is a common use of local revenue.", role: "use" },
    { id: "n5", label: "Roads & safety", detail: "Infrastructure, fire, emergency services.", role: "use" },
    { id: "n6", label: "Parks & local government", detail: "Shared civic places and operations.", role: "use" },
  ],
};

const quizItems: AssessmentItem[] = [
  q("q1", "mcq", "Sales tax is best described as a tax on", ["income earned at a job", "goods and some services at purchase", "property you own", "money kept in a bank"], "B", 1, undefined, "Define sales tax"),
  q("q2", "mcq", "A $40.00 item at 7.25% sales tax has a tax of", ["$7.25", "$2.90", "$4.00", "$0.73"], "B", 1, "40 × 0.0725 = 2.90", "Calculate"),
  q("q3", "mcq", "The total for that $40.00 item at 7.25% is", ["$40.00", "$42.90", "$47.25", "$32.75"], "B", 1, undefined, "Calculate"),
  q("q4", "tf", "The listed shelf price is always the amount the customer pays.", undefined, "false", 1, "Many prices are pre-tax."),
  q("q5", "mcq", "Two towns can charge different totals for the same item mainly because", ["cashiers pick a rate they like", "combined state and local rates differ by location", "credit cards add their own tax", "stores are not allowed to show tax"], "B", 1, undefined, "Rate variation"),
  q("q6", "mcq", "Sales tax revenue is most accurately described as", ["the store’s extra profit", "public revenue for services such as schools and roads", "a shipping fee", "a tip"], "B", 1, undefined, "Where money goes"),
  q("q7", "short", "A $25.00 item is taxed at 6%. Find the tax and the total. Show the decimal you used.", undefined, "Tax $1.50; total $26.50", 2),
  q("q8", "short", "In one or two sentences, explain why a receipt is more trustworthy than a memorized “national rate.”", undefined, "There is no single national rate; the receipt shows the combined rate that applied.", 2),
];

const quiz: QuizDoc = {
  kind: "quiz",
  title: "Sales tax quiz",
  course: COURSE,
  instructions: "Calculators permitted. Write the decimal for every calculation. Round to the nearest cent.",
  items: quizItems,
  includeKey: true,
};

const exitTicket: QuizDoc = {
  kind: "exit-ticket",
  title: "Exit ticket — sales tax",
  course: COURSE,
  instructions: "Four minutes. Show work on #1.",
  includeKey: true,
  items: [
    q("e1", "short", "$18.00 at 5% tax. Tax and total?", undefined, "Tax $0.90; total $18.90", 1),
    q("e2", "mcq", "The extra money on the tax line is", ["store profit", "public revenue", "a card fee"], "B", 1),
    q("e3", "short", "Name one public service that revenue often helps fund.", undefined, "Schools / roads / fire / parks / local government", 1),
  ],
};

const infographic: InfographicDoc = {
  kind: "infographic",
  kicker: "Practical mathematics",
  title: "Sales tax, at a glance",
  subtitle: "A receipt is a short civic document. Read the tax line.",
  footer: "Example rate 7.25% is labeled as an example. Look up the combined rate for a real address.",
  bands: [
    {
      kicker: "Definition",
      title: "A tax on buying",
      body: "Collected at the register or checkout page. Not income tax. Not a tip.",
      stat: "Buy",
    },
    {
      kicker: "Formula",
      title: "Percent of the price",
      body: "Write the rate as a decimal. Multiply. Round to the cent. Or use Total = Price × (1 + rate).",
      stat: "7.25%",
    },
    {
      kicker: "Example",
      title: "$40.00 headphones",
      body: "Tax $2.90. Total $42.90. Estimate first: 10% would be $4, so 7% cannot be $7.",
      stat: "$2.90",
      src: "/media/currency.jpg",
    },
    {
      kicker: "Variation",
      title: "Rates stack",
      body: "State + city + county + district. The sale location sets the combined rate.",
      stat: "Local",
    },
    {
      kicker: "Use",
      title: "Where it goes",
      body: "Schools, roads, fire and emergency services, parks, local government.",
      stat: "Public",
      src: "/media/school.jpg",
    },
  ],
};

const lessonPlan: LessonPlanDoc = {
  kind: "lesson-plan",
  title: "Sales tax — lesson plan",
  course: COURSE,
  duration: "One 55-minute period",
  objectives: SALES_TAX_BLUEPRINT.objectives,
  materials: [
    "Presentation",
    "Guided notes",
    "Worksheet",
    "Exit ticket",
    "One real receipt (optional)",
    "Calculators",
  ],
  sequence: SALES_TAX_BLUEPRINT.sequence,
  checks: SALES_TAX_BLUEPRINT.checks,
  differentiation: SALES_TAX_BLUEPRINT.differentiation,
  closure: "Exit ticket: one calculation, one civic item. Preview tomorrow’s reverse problem (total → pre-tax price).",
  notes: SALES_TAX_BLUEPRINT.answerNotes,
};

const activity: WorksheetDoc = {
  kind: "activity",
  template: "scenario",
  title: "Receipt desk — a shopping activity",
  course: COURSE,
  studentLine: true,
  directions:
    "Work with a partner. You are checking receipts before a group leaves a store. Use the labeled example rates. Round to the nearest cent.",
  sections: [
    {
      type: "scenario",
      title: "Station 1 — Subtotal $24.00, rate 6%",
      body: "A student thinks the total should be $24.00 because that is what the shelf said.",
      prompt: "Compute tax and total. Write one sentence you would say to explain the difference.",
    },
    {
      type: "scenario",
      title: "Station 2 — Two towns",
      body: "Same $40.00 item. Town A 7.25%. Town B 8.5%.",
      prompt: "Find both totals. How much more does Town B pay? Why is neither student being overcharged?",
    },
    {
      type: "scenario",
      title: "Station 3 — Where it goes",
      body: "Your group collected $2.90 in tax on one accessory.",
      prompt: "Name three public services that revenue of this kind typically helps fund. Circle the one you would want a budget hearing to defend.",
    },
  ],
};

function q(
  id: string,
  kind: AssessmentItem["kind"],
  prompt: string,
  choices?: string[],
  correct?: string,
  points = 1,
  feedback?: string,
  objective?: string,
): AssessmentItem {
  const letters = ["A", "B", "C", "D", "E"];
  return {
    id,
    kind,
    prompt,
    choices: choices?.map((text, i) => ({ id: letters[i] ?? String(i), text })),
    correct,
    points,
    feedback,
    objective,
  };
}

export function buildSalesTaxProject(): Project {
  const artifacts = [
    artifactFromDoc("presentation", "Sales tax — presentation", presentation),
    artifactFromDoc("news-article", "The extra dollars at the register", article),
    artifactFromDoc("worksheet", "Sales tax — practice", worksheet),
    artifactFromDoc("guided-notes", "Sales tax — guided notes", notes),
    artifactFromDoc("organizer", "From the receipt to the town", organizer),
    artifactFromDoc("activity", "Receipt desk", activity),
    artifactFromDoc("quiz", "Sales tax quiz", quiz),
    artifactFromDoc("exit-ticket", "Exit ticket", exitTicket),
    artifactFromDoc("infographic", "Sales tax, at a glance", infographic),
    artifactFromDoc("lesson-plan", "Lesson plan", lessonPlan),
  ];
  return {
    id: "seed-sales-tax",
    name: "Sales Tax — LSC Math",
    prompt:
      "Create a lesson for grades 9–11 about sales tax. Explain what sales tax is, how it is calculated, why rates vary, how rates are determined, where the money goes, and how students encounter sales tax in everyday life.",
    profileId: "lsc-math",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blueprint: SALES_TAX_BLUEPRINT,
    artifacts,
    activeArtifactId: artifacts[0]?.id ?? null,
    favorites: [],
  };
}
