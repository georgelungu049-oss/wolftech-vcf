// =============================================================
//  WOLFTECH VCF — CONFIGURATION
// =============================================================
//
//  All sensitive values are read from environment variables /
//  Replit Secrets. Set them in the Secrets tab in Replit.
//
//  DATABASE_URL   — PostgreSQL connection string (auto-provided
//                   by Replit's built-in DB, or set your own)
//  ADMIN_PIN      — PIN to access the /admin panel
//  CONTACT_TARGET — How many contacts unlock the VCF download
//                   (can also be changed from /admin)
//
// =============================================================

const DATABASE_URL = process.env["DATABASE_URL"];
const ADMIN_PIN = process.env["ADMIN_PIN"];
const CONTACT_TARGET = process.env["CONTACT_TARGET"];

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Set it in the Replit Secrets tab.",
  );
}

if (!ADMIN_PIN) {
  throw new Error(
    "ADMIN_PIN environment variable is required. Set it in the Replit Secrets tab.",
  );
}

export const config = {
  DATABASE_URL,

  ADMIN_PIN,

  CONTACT_TARGET: CONTACT_TARGET ? Number(CONTACT_TARGET) : 50,
};
