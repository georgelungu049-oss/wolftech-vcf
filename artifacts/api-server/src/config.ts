/**
 * WOLFTECH VCF — Configuration
 * ─────────────────────────────────────────────────────────────
 * Fill in your own values here before deploying.
 *
 * DATABASE_URL  →  Any PostgreSQL connection string.
 *                  Recommended free options:
 *                    • Neon      https://neon.tech  (best for Vercel)
 *                    • Supabase  https://supabase.com
 *                    • Railway   https://railway.app
 *                  Format: postgresql://user:password@host/dbname?sslmode=require
 *
 * ADMIN_PIN     →  The PIN you use to log in at /admin.
 *                  Change this to anything you like.
 *
 * CONTACT_TARGET → Default number of contacts to collect before
 *                  the VCF download unlocks. Admins can override
 *                  this from the /admin panel at any time.
 */

export const config = {
  DATABASE_URL: "postgresql://your_user:your_password@your_host/your_db?sslmode=require",

  ADMIN_PIN: "wolf906",

  CONTACT_TARGET: 50,
};
