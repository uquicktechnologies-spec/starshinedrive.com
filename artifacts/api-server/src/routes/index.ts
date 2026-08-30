import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crmRouter from "./crm";
import stockRouter from "./stock";
import storageRouter from "./storage";
import webContentRouter from "./webContent";
import emailMarketingRouter from "./emailMarketing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crmRouter);
router.use(stockRouter);
router.use(storageRouter);
router.use(webContentRouter);
router.use(emailMarketingRouter);

export default router;
