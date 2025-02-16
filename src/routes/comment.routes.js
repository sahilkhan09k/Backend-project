import { Router } from "express";
import { addComments, deleteComment, getVideoComments, updateComment } from "../controllers/comments.controller.js";
import {verifyJwt} from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/getComments/:videoId").get(getVideoComments);
router.route("/addComment/:videoId").post(verifyJwt, addComments);
router.route("/videos/:videoId/comments/:commentId").patch(verifyJwt, updateComment);
router.route("/delteComment/:commentId").delete(verifyJwt, deleteComment)



export default router;

