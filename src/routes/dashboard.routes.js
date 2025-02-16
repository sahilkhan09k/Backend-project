import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";


const router = Router();

router.route("/getChannelStats").get(verifyJwt, getChannelStats);
router.route("/getChannelVideos").get(verifyJwt, getChannelVideos);


export default router;