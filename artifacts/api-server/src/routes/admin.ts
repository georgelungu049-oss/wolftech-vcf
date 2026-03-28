import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactsTable, settingsTable, appConfigTable } from "@workspace/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { config } from "../../../../config";

const router: IRouter = Router();

/* ─── Auth ─────────────────────────────────────────────────────────────────
   PIN is read from the DB on every request so password changes take effect
   immediately without a restart. Falls back to config.ADMIN_PIN (wolf906). */
async function getAdminPin(): Promise<string> {
  try {
    const [row] = await db
      .select()
      .from(appConfigTable)
      .where(eq(appConfigTable.key, "admin_pin"));
    return row?.value ?? config.ADMIN_PIN;
  } catch {
    return config.ADMIN_PIN;
  }
}

async function checkAuth(
  req: import("express").Request,
  res: import("express").Response,
): Promise<boolean> {
  const pin = (req.headers["x-admin-pin"] ?? req.query["pin"]) as string | undefined;
  const adminPin = await getAdminPin();
  if (pin !== adminPin) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

/* GET /api/admin/stats */
router.get("/stats", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "target"));
    const target = row?.value ?? config.CONTACT_TARGET;
    const [countRow] = await db.select({ count: count() }).from(contactsTable);
    const contactCount = Number(countRow?.count ?? 0);
    res.json({
      count: contactCount,
      target,
      percentage: Math.min(Math.round((contactCount / target) * 1000) / 10, 100),
      targetReached: contactCount >= target,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/admin/contacts — full list */
router.get("/contacts", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  try {
    const contacts = await db
      .select()
      .from(contactsTable)
      .orderBy(desc(contactsTable.createdAt));
    res.json({ contacts });
  } catch (err) {
    req.log.error({ err }, "Admin list contacts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PUT /api/admin/target */
router.put("/target", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  const raw = req.body?.target;
  const target = Number(raw);
  if (!Number.isInteger(target) || target < 1 || target > 100000) {
    res.status(422).json({ error: "target must be an integer between 1 and 100000" });
    return;
  }
  try {
    await db
      .insert(settingsTable)
      .values({ key: "target", value: target })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: target } });
    res.json({ success: true, target });
  } catch (err) {
    req.log.error({ err }, "Admin set target error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PUT /api/admin/password — change admin PIN */
router.put("/password", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  const { newPin } = req.body ?? {};
  if (!newPin || typeof newPin !== "string" || newPin.trim().length < 4) {
    res.status(422).json({ error: "New PIN must be at least 4 characters" });
    return;
  }
  try {
    await db
      .insert(appConfigTable)
      .values({ key: "admin_pin", value: newPin.trim() })
      .onConflictDoUpdate({ target: appConfigTable.key, set: { value: newPin.trim() } });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin change password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/admin/site-settings — read all app_config keys */
router.get("/site-settings", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  try {
    const rows = await db.select().from(appConfigTable);
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (row.key !== "admin_pin") settings[row.key] = row.value;
    }
    res.json({ settings });
  } catch (err) {
    req.log.error({ err }, "Admin get site settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PUT /api/admin/site-settings — update one or more app_config keys */
router.put("/site-settings", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  const updates = req.body?.settings as Record<string, string> | undefined;
  if (!updates || typeof updates !== "object") {
    res.status(422).json({ error: "Provide a settings object" });
    return;
  }
  const forbidden = ["admin_pin"];
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => !forbidden.includes(k) && typeof v === "string"),
  );
  try {
    for (const [key, value] of Object.entries(sanitized)) {
      await db
        .insert(appConfigTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: appConfigTable.key, set: { value } });
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin update site settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* DELETE /api/admin/contacts */
router.delete("/contacts", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  const rawId = req.query["id"];
  if (!rawId) {
    try {
      await db.delete(contactsTable);
      res.json({ success: true, cleared: true });
    } catch (err) {
      req.log.error({ err }, "Admin clear all contacts error");
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    res.status(422).json({ error: "Provide a valid ?id= query param" });
    return;
  }
  try {
    await db.delete(contactsTable).where(eq(contactsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete contact error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/admin/download */
router.get("/download", async (req, res) => {
  if (!(await checkAuth(req, res))) return;
  try {
    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);
    const vcfEntries = contacts.map((c) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${c.fullName}`, `N:${c.fullName};;;`, `TEL;TYPE=CELL,VOICE:${c.phone}`];
      if (c.email) lines.push(`EMAIL:${c.email}`);
      if (c.organization) lines.push(`ORG:${c.organization}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    });
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="wolftech-contacts.vcf"`);
    res.send(vcfEntries.join("\r\n"));
  } catch (err) {
    req.log.error({ err }, "Admin download error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
