# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Project: **WOLF TECH VCF** — a dark-themed digital contact card with a crowd-sourced VCF unlock system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Replit PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Frontend**: React 19 + Vite 7 + TailwindCSS 4 + Wouter

## Structure

```text
.
├── artifacts/
│   ├── vcf-card/           # React + Vite frontend (port 25326)
│   │   ├── src/pages/
│   │   │   ├── DigitalCard.tsx   # Public contact card
│   │   │   └── Admin.tsx         # Admin panel (/admin)
│   │   └── public/               # favicon, og-image.png
│   └── api-server/         # Express API server (port 8080)
│       └── src/
│           ├── routes/     # contacts, admin, health
│           └── setup-env.ts
│
├── lib/
│   ├── db/                 # Drizzle ORM + schema (contacts, settings tables)
│   └── api-zod/            # Zod validation schemas
│
├── config.ts               # Reads DATABASE_URL, ADMIN_PIN, CONTACT_TARGET from env
└── vercel.json             # Legacy Vercel config (no longer active)
```

## Applications

### `artifacts/vcf-card` — WOLF TECH Digital Card

**Features:**
- Visitors submit name + phone (international input with flag selector, E.164 format)
- Progress bar tracking contacts toward configurable target
- When target reached → VCF file becomes downloadable
- Post-submit success modal with channel/group CTAs
- Duplicate phone detection (amber "already in system" message)
- Dark green cyber/matrix theme
- PIN-protected admin panel at `/admin`

### `artifacts/api-server` — Express API Server

Runs on port 8080. Routes: `/api/contacts`, `/api/admin`, `/api/healthz`.

## Database Schema

### `contacts` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | Auto-increment |
| full_name | text | Required |
| phone | text UNIQUE | E.164 format, prevents duplicates |
| email | text | Optional |
| organization | text | Optional |
| created_at | timestamp | Auto |

### `settings` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| key | text UNIQUE | e.g. `'target'` |
| value | integer | e.g. `100` |

Run `cd lib/db && pnpm run push` to apply schema changes to the database.

## Environment Variables / Secrets

All sensitive values are in Replit Secrets (never hardcoded):
- `DATABASE_URL` — auto-provided by Replit's built-in PostgreSQL
- `ADMIN_PIN` — protects `/admin` panel
- `CONTACT_TARGET` — set as env var (default: 50)

## Workflows

- **Start application** — Vite dev server for the frontend (`PORT=25326`)
- **API Server** — Express backend (`PORT=8080`)

## TypeScript

Every package extends `tsconfig.base.json` with `composite: true`.
Run `pnpm run typecheck` from the root to check all packages.

## Deployment

Build command: `pnpm --filter @workspace/vcf-card run build`
API server is built via esbuild in `artifacts/api-server/build.mjs`
