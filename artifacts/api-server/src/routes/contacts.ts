import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactsTable, settingsTable } from "@workspace/db/schema";
import { SubmitContactBody } from "@workspace/api-zod";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

async function getStats() {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "target"));
  const target = row?.value ?? 50;
  const [countRow] = await db.select({ count: count() }).from(contactsTable);
  const contactCount = Number(countRow?.count ?? 0);
  const percentage = Math.min((contactCount / target) * 100, 100);
  return {
    count: contactCount,
    target,
    percentage: Math.round(percentage * 10) / 10,
    targetReached: contactCount >= target,
  };
}

router.post("/", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Validation failed" });
    return;
  }

  const { fullName, phone, email, organization } = parsed.data;

  try {
    const [inserted] = await db
      .insert(contactsTable)
      .values({ fullName, phone, email: email ?? null, organization: organization ?? null })
      .returning({ id: contactsTable.id });

    const stats = await getStats();

    res.status(201).json({
      id: inserted.id,
      message: "Contact saved successfully",
      stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("unique") || message.includes("duplicate")) {
      res.status(409).json({ error: "This phone number has already been submitted" });
      return;
    }
    req.log.error({ err }, "Failed to insert contact");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/download", async (req, res) => {
  try {
    const stats = await getStats();
    if (!stats.targetReached) {
      res.status(403).json({ error: `Target not yet reached. ${stats.count}/${stats.target} contacts collected.` });
      return;
    }

    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);

    const vcfEntries = contacts.map((c) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${c.fullName}`,
        `N:${c.fullName};;;`,
        `TEL;TYPE=CELL,VOICE:${c.phone}`,
      ];
      if (c.email) lines.push(`EMAIL:${c.email}`);
      if (c.organization) lines.push(`ORG:${c.organization}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    });

    const vcfContent = vcfEntries.join("\r\n");

    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="wolfxnode-contacts.vcf"`);
    res.send(vcfContent);
  } catch (err) {
    req.log.error({ err }, "Failed to generate VCF");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
