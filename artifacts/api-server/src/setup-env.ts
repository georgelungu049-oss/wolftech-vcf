/**
 * This module must be the first import in index.ts.
 * It pushes config values into process.env so that
 * libraries (like the DB client) that read process.env
 * pick up the right values at startup.
 */
import { config } from "./config";

// Only override if the env var isn't already set externally
// (so real env vars on Vercel/Railway still take priority)
if (!process.env["DATABASE_URL"]) {
  process.env["DATABASE_URL"] = config.DATABASE_URL;
}
if (!process.env["ADMIN_PIN"]) {
  process.env["ADMIN_PIN"] = config.ADMIN_PIN;
}
