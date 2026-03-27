# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── vcf-card/           # wolfXnode Digital Card (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Applications

### `artifacts/vcf-card` — wolfXnode Digital Card

A cyber-themed digital contact card with contact collection functionality.

**Features:**
- Visitors fill in their name + phone (+ optional email/org) to add their contact
- Progress bar tracking collected contacts toward a configurable target
- When target is reached, a `/api/contacts/download` endpoint serves a VCF file of all collected contacts
- Social links: WhatsApp, YouTube, WA Channel, WA Group, Platform
- Duplicate phone detection (409 Conflict)
- Dark green cyber/matrix theme with animated grid, floating orbs, and glow effects

**Contact target:** Set in the `settings` table with key `'target'` (default: 50)

### `artifacts/api-server` — Express API Server

Shared backend serving all API routes under `/api`.

**Routes:**
- `GET /api/healthz` — health check
- `POST /api/contacts` — submit a contact (name, phone, optional email/org)
- `GET /api/contacts/stats` — get count, target, percentage, targetReached
- `GET /api/contacts/download` — download VCF of all contacts (403 until target reached)

## Database Schema

### `contacts` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | Auto-increment |
| full_name | text | Required |
| phone | text UNIQUE | Required, prevents duplicates |
| email | text | Optional |
| organization | text | Optional |
| created_at | timestamp | Auto |

### `settings` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| key | text UNIQUE | e.g. `'target'` |
| value | integer | e.g. `50` |

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `lib/db` (`@workspace/db`)

- `src/schema/contacts.ts` — `contactsTable`, `settingsTable` with Zod insert schemas
- Run `pnpm --filter @workspace/db run push` to sync schema

### `lib/api-spec` (`@workspace/api-spec`)

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### Changing the contact target

```sql
UPDATE settings SET value = 100 WHERE key = 'target';
```
