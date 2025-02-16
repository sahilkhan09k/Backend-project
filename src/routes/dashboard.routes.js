import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller";


const router = Router();

router.route("/getChannelStats").get(verifyJwt, getChannelStats);
router.route("/getChannelVideos").get(verifyJwt, getChannelVideos);


export default router;