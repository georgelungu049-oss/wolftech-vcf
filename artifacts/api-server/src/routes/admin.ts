import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactsTable, settingsTable } from "@workspace/db/schema";
import { eq, count, desc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PIN = process.env["ADMIN_PIN"] ?? "wolf906";

function checkAuth(req: import("express").Request, res: import("express").Response): boolean {
  const pin = req.headers["x-admin-pin"] ?? req.query["pin"];
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

/* GET /api/admin/stats */
router.get("/stats", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "target"));
    const target = row?.value ?? 50;
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

/* GET /api/admin/contacts — paginated list */
router.get("/contacts", async (req, res) => {
  if (!checkAuth(req, res)) return;
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
  if (!checkAuth(req, res)) return;
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

/* DELETE /api/admin/contacts/:id */
router.delete("/contacts/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id < 1) {
    res.status(422).json({ error: "Invalid id" });
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

/* GET /api/admin/download — always available for admin */
router.get("/download", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);
    const vcfEntries = contacts.map((c) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${c.fullName}`, `N:${c.fullName};;;`, `TEL;TYPE=CELL,VOICE:${c.phone}`];
      if (c.email) lines.push(`EMAIL:${c.email}`);
      if (c.organization) lines.push(`ORG:${c.organization}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    });
    const vcf = vcfEntries.join("\r\n");
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="wolftech-contacts.vcf"`);
    res.send(vcf);
  } catch (err) {
    req.log.error({ err }, "Admin download error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
