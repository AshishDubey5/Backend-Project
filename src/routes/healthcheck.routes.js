import { Router } from "express";
import { healthcheck } from "../controller/healthCheck.controller.js";

const router = Router();

router.route("/healthcheck").get(healthcheck);

export default router;
