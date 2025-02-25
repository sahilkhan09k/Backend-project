import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";



const router = Router();


router.route("toggleVideoLike/:videoId").post(verifyJwt, toggleVideoLike);
router.route("toggleComment/:commentId").post(verifyJwt, toggleCommentLike);
router.route("toggleTweetLike/:tweetId").post(verifyJwt, toggleTweetLike);
router.route("/getLikedVideos").get(verifyJwt, getLikedVideos);

export default router;