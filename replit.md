# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Project: **WOLF TECH VCF** — a dark-themed digital contact card with a crowd-sourced VCF unlock system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (local dev) / Vercel Serverless Functions (production)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Frontend**: React 19 + Vite 7 + TailwindCSS 4 + Wouter

## Structure

```text
.
├── api/                    # Vercel serverless functions (production)
│   ├── contacts/           #   POST, GET stats, download VCF
│   ├── admin/              #   PIN-protected admin endpoints
│   ├── _db.ts              #   DB connection + auto table creation
│   ├── _auth.ts            #   PIN auth helper
│   └── _vcf.ts             #   VCF file generator
│
├── artifacts/
│   ├── vcf-card/           # React + Vite frontend
│   │   ├── src/pages/
│   │   │   ├── DigitalCard.tsx   # Public contact card
│   │   │   └── Admin.tsx         # Admin panel (/admin)
│   │   └── public/               # favicon, og-image.png
│   └── api-server/         # Express server (Replit local dev only)
│
├── lib/
│   ├── db/                 # Drizzle ORM + schema (contacts, settings tables)
│   └── api-zod/            # Zod validation schemas
│
├── config.ts               # Single config: DATABASE_URL, ADMIN_PIN, CONTACT_TARGET
├── vercel.json             # Vercel build + routing config
└── README.md
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

Used only in local/Replit development. The same logic lives in `api/` as Vercel functions.

## Database Schema

### `contacts` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | Auto-increment |
| full_name | text | Required |
| phone | text UNIQUE | E.164 format, prevents duplicates |
| created_at | timestamp | Auto |

### `settings` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| key | text UNIQUE | e.g. `'target'` |
| value | integer | e.g. `100` |

Tables are auto-created on first API call — no migration needed.

## Config

All environment-sensitive values live in `config.ts`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ADMIN_PIN` — protects `/admin`
- `CONTACT_TARGET` — how many contacts unlock the VCF

## TypeScript

Every package extends `tsconfig.base.json` with `composite: true`.
Run `pnpm run typecheck` from the root to check all packages.

## Vercel Deployment

Build command: `pnpm --filter @workspace/vcf-card run build`
Output directory: `dist/` (project root, configured in `vercel.json`)
Root directory in Vercel dashboard: leave blank (project root)
