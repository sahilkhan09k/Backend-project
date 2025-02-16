import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import {healthCheckController} from "../controllers/healthCheck.controller";

const router = Router();

router.route("/healthCheck").get(healthCheckController);

export default router;