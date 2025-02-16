import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { createTweet, deletTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller";


const router = Router();

router.route("/createTweet").post(verifyJwt, createTweet);
router.route("/getUserTweets").get(verifyJwt, getUserTweets);
router.route("/updateTweet/:tweetId").put(verifyJwt, updateTweet);
router.route("/deleteTweet/:tweetId").delete(verifyJwt, deletTweet);


export default router;