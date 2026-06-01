# AI Wedding Chief of Staff

A PM interview portfolio project — an AI-native wedding planning tool that acts as a personal chief of staff.

## Demo Narrative

Wedding planning information is fragmented across emails, spreadsheets, vendor portals, and planning apps. Brides don't need another spreadsheet. They need a chief of staff.

This prototype ingests wedding planning documents and continuously answers three questions:
1. What have I completed?
2. What am I forgetting?
3. What should I do next?

## Features

- **Upload or paste** vendor lists, budgets, and timelines (CSV or freeform notes)
- **Wedding Readiness Score** — AI-synthesized progress gauge
- **Dashboard** — budget tracker, open risks, upcoming tasks, vendor snapshot
- **Vendor Tracker** — full table with status badges and due dates
- **Budget** — category-level progress bars with overspend warnings
- **AI Planner** — live Claude-powered chat with full wedding context injected

## Tech Stack

- React 18 + Vite
- Client-side CSV parsing (no backend)
- localStorage for state persistence
- Anthropic Claude API (claude-sonnet-4) for AI Planner

## Deploy to Vercel (5 minutes)

### Option A — GitHub + Vercel (recommended)

1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework preset: **Vite**
4. Add environment variable: `VITE_ANTHROPIC_API_KEY=your_key_here`
5. Click Deploy

### Option B — Vercel CLI

```bash
npm install -g vercel
cd wedding-chief-of-staff
npm install
vercel
```

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Sample Data

Sample CSVs are in `/public/sample-data/` — use these to demo the upload flow.

## CSV Formats

### vendors.csv
```
Vendor,Category,Status,Cost,DueDate
Grand Island Mansion,Venue,Complete,25000,
Vivi Photography,Photography,Payment Due,4500,2026-06-10
```

### budget.csv
```
Category,Budget,Spent
Venue,30000,25000
Photography,5000,0
```

### timeline.csv
```
Date,Task,Priority
2026-06-10,Photographer Final Payment,High
2026-06-12,Transportation Finalization,High
```
