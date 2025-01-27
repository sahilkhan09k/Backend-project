import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser,changeProfileDetails,updateUserAvatar,updateCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
         {
            name : "avatar",
            maxCount : 1,

         },
         {
            name : "coverimage",
            maxCount : 1
         }
    ]),

    registerUser
)

router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJwt,logoutUser)

router.route("/Refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJwt, changeCurrentPassword)

router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/Change-details").patch(verifyJwt, changeProfileDetails)

router.route("/update-avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)


router.route("/update-coverImage").patch(verifyJwt, upload.single("coverimage"), updateCoverImage)

router.route("/c/:userName").get(verifyJwt, getUserChannelProfile)

router.route("/history").get(verifyJwt, getWatchHistory)
export default router;