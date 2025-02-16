import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {toggleSubscription, getUserChannelSubscribers,
    getSubscribedChannel } from "../controllers/subscription.controller.js"


const router = Router();

router.route("/toggleSubscription/:channelId").post(verifyJwt, toggleSubscription);
router.route("/getUserChannelSubscribers/:channelId").get(verifyJwt, getUserChannelSubscribers);
router.route("/getSubscribedChannel").get(verifyJwt, getSubscribedChannel);


export default router