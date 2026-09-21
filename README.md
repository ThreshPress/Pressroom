# PRESSROOM

by ThreshPress

**Create once. Press it into any format.**

PRESSROOM is an instructional design studio. Describe a lesson once. It builds a blueprint, then presses that blueprint into presentations, articles, worksheets, organizers, quizzes, infographics, and more.

This app runs on its own — from GitHub, on your computer, or on a host you control. It is not tied to Grok.

---

## Open it from GitHub (no install)

This is the fastest way to *use* PRESSROOM.

[![Open in GitHub Codespaces](https://img.shields.io/badge/Open_PRESSROOM-GitHub_Codespaces-111111?logo=github&logoColor=white)](https://codespaces.new/ThreshPress/Pressroom?quickstart=1)

1. Open **[ThreshPress/Pressroom](https://github.com/ThreshPress/Pressroom)**.
2. Click the green **Code** button.
3. Choose **Codespaces**.
4. Click **Create codespace on main**.

Wait about a minute. GitHub starts the studio and opens it in a browser tab. That tab *is* PRESSROOM.

Then:

- Open the **Sales Tax** sample project and press it into slides, a news article, a worksheet, a quiz, and more.
- Use **Develop** to write a new lesson (needs an xAI key — see below).
- In Chrome or Edge: **Install page as app** to pin PRESSROOM to your desktop.

---

## Put it on a permanent website

Codespaces is great for working. For a bookmarkable studio URL, deploy this repo to [Vercel](https://vercel.com) (free):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ThreshPress/Pressroom&env=XAI_API_KEY&envDescription=xAI%20API%20key%20for%20Develop%2C%20Press%2C%20Adapt%2C%20and%20Ask%20Pressroom&project-name=pressroom&repository-name=Pressroom)

After it deploys, you get a URL like `pressroom.vercel.app`. Open that URL anytime. Install it as a desktop app from the browser.

Add `XAI_API_KEY` when Vercel asks, so AI features work on that site.

---

## Run it on your computer

You need [Node.js 22+](https://nodejs.org).

```bash
git clone https://github.com/ThreshPress/Pressroom.git
cd Pressroom
npm install
cp .env.example .env
# edit .env and paste your xAI key (optional)
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

---

## AI key (for new lessons)

The sample project works with no key.

**Develop**, **Press**, **Adapt**, and **Ask Pressroom** need an [xAI API key](https://console.x.ai).

| Where you run it | How to add the key |
| --- | --- |
| GitHub Codespaces | Repo **Settings → Secrets and variables → Codespaces → New secret** named `XAI_API_KEY` |
| Vercel | Project **Settings → Environment Variables** |
| Your computer | Put `XAI_API_KEY=…` in a `.env` file in this folder |

---

## What it does

- **Develop** — turn a prompt into a structured instructional blueprint.
- **Press** — render that blueprint into classroom-ready formats.
- **Edit** — tune pages, copy, and visuals in a print-inspired workspace.
- **Export** — HTML for Canvas/LMS, QTI for assessments, print/PDF from the browser.

Projects are stored in the browser on the machine you use. No account required.

## Stack

React, TanStack Start, Tailwind CSS v4.
