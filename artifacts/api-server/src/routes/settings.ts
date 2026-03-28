import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { appConfigTable } from "@workspace/db/schema";

const router: IRouter = Router();

const SETTING_KEYS = ["whatsapp", "youtube", "wa_channel", "wa_group"] as const;

const DEFAULTS: Record<string, string> = {
  whatsapp:   "https://wa.me/254713046497",
  youtube:    "https://www.youtube.com/@Silentwolf906",
  wa_channel: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y",
  wa_group:   "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",
};

/* GET /api/settings — public, no auth required */
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(appConfigTable);
    const stored: Record<string, string> = {};
    for (const row of rows) stored[row.key] = row.value;

    const settings: Record<string, string> = {};
    for (const key of SETTING_KEYS) {
      settings[key] = stored[key] ?? DEFAULTS[key];
    }
    res.json({ settings });
  } catch (err) {
    req.log.error({ err }, "Public settings error");
    res.json({ settings: DEFAULTS });
  }
});

export default router;
