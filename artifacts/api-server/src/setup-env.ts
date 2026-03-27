// Internal startup file — loads config.ts (project root) into the runtime
// before the database connection is opened. Do not move or delete.
import { config } from "../../../config";

if (!process.env["DATABASE_URL"]) {
  process.env["DATABASE_URL"] = config.DATABASE_URL;
}
if (!process.env["ADMIN_PIN"]) {
  process.env["ADMIN_PIN"] = config.ADMIN_PIN;
}
