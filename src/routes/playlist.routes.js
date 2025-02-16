import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, deletePlayList, getPlayListById, getUserPlayLists, removeVideoFromPlayList, updatePlayList } from "../controllers/playlist.controller.js";


const router = Router();

router.route("/createPlayLyst").post(verifyJwt, createPlayList);
router.route("/getUserPlayList").get(verifyJwt, getUserPlayLists);
router.route("/getPlayListById/:playListId").get(verifyJwt, getPlayListById);
router.route("/playList/:playListId/addVideo/:videoId").patch(verifyJwt, addVideoToPlayList);
router.route("/playList/:playListId/removeVideo/:videoId").patch(verifyJwt, removeVideoFromPlayList);
router.route("/playList/:playListId").delete(verifyJwt, deletePlayList);
router.route("/updatePlayList/:playListId").patch(verifyJwt, updatePlayList);


export default router;