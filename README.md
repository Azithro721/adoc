# ✿ Aesthetic Notes Studio

A web app that transforms plain `.docx` files into beautiful, pastel-coloured, handwriting-style notes — ready to open in Microsoft Word or Google Docs.

## Features

- **Upload** any `.docx` (drag & drop or click to browse)
- **Auto-styles** every heading level with its own pastel colour & cute symbol
- **Colour-coded hierarchy**: title (purple) → H1 (pink) → H2 (teal) → H3 (amber) → H4 (green)
- **Cute bullets** (✧), **note boxes** (📝), and **dividers** (✿)
- **Segoe Script** handwriting font throughout
- **No sign-up, no storage** — files are processed in memory and discarded immediately

---

## Deploy to Vercel (2 minutes)

### Option A — Vercel CLI

```bash
npm install -g vercel   # if not already installed
cd aesthetic-notes-web
npm install
vercel                  # follow prompts, deploy!
```

### Option B — GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repo
4. Leave all settings as default (Framework: Next.js is auto-detected)
5. Click **Deploy**

No environment variables needed.

---

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 14 (Pages Router) |
| Document input | `mammoth` (docx → HTML) |
| HTML parsing | `node-html-parser` |
| Document output | `docx` v8 |
| File upload | `formidable` v3 |

---

## Limitations

- Input must be `.docx` (not `.doc`, `.odt`, `.pdf`)
- Images in the source document are not carried over (text only)
- Max file size: 20 MB
- Vercel Hobby plan: 10s function timeout (sufficient for typical documents)
