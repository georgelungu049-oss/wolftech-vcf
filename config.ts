// =============================================================
//  WOLFTECH VCF — CONFIGURATION
// =============================================================
//
//  Values are read from environment variables first.
//  If an env var is not set, the hardcoded default below is used.
//
//  DATABASE_URL   — PostgreSQL connection string
//  ADMIN_PIN      — PIN to access the /admin panel  (default: Paxton123)
//  CONTACT_TARGET — How many contacts unlock the VCF download
//
// =============================================================

export const config = {
  DATABASE_URL: process.env["DATABASE_URL"] ?? "postgresql://neondb_owner:npg_ZUjtalB2X6Eo@ep-round-truth-am6hywy3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",

  ADMIN_PIN: process.env["ADMIN_PIN"] ?? "Paxton123",

  CONTACT_TARGET: process.env["CONTACT_TARGET"]
    ? Number(process.env["CONTACT_TARGET"])
    : 50,
};
