// Checks the admin PIN on incoming requests.
// The PIN is set in config.ts at the project root.
import { config } from "../config";

const ADMIN_PIN = process.env.ADMIN_PIN || config.ADMIN_PIN;

export function isAuthorized(req: any): boolean {
  const pin = (req.headers["x-admin-pin"] as string) || (req.query?.pin as string);
  return pin === ADMIN_PIN;
}
