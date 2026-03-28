import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import adminRouter from "./admin";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contacts", contactsRouter);
router.use("/admin", adminRouter);
router.use("/settings", settingsRouter);

export default router;
