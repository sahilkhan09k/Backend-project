import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishVideo, updateThumbnail, updateToggleStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();
 
//router to upload video
router.route("/upload-video").post(verifyJwt,
    upload.fields([
        {
             name: "thumbNail",
            maxCount: 1
        }, 
        {
            name: "videoFile",
            maxCount: 1
        }
    ]),
    publishVideo
    )

//rouetr to get video id
router.route("/v/:videoId").get(getVideoById)

//router to update video details
router.route("/videosUpdate/:videoId").patch(verifyJwt, updateVideo)

//router to update thumbnal
router.route("/updateThumbnail/:videoId").patch(verifyJwt, upload.single("thumbNail"),updateThumbnail)


//route to delete the video
router.route("/delte-Video/:videoId").delete(verifyJwt, deleteVideo)

//to update toggle status
router.route("/updateToggleStatus/:videoId").patch(verifyJwt, updateToggleStatus)

export default router