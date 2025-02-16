import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {healthCheckController} from "../controllers/healthCheck.controller.js";

const router = Router();

router.route("/healthCheck").get(healthCheckController);

export default router;