import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser,changeProfileDetails,updateUserAvatar,updateCoverImage} from "../controllers/user.controller.js";
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
router.route("/current-user").post(verifyJwt, getCurrentUser)
router.route("/Change-details").post(verifyJwt, changeProfileDetails)
router.route("/update-avatar").post(upload.fields([{
   name : "avatar",
   maxCount : 1
}]), verifyJwt, updateUserAvatar)
router.route("/update-coverImage").post(upload.fields([{
   name : "coverimage",
   maxCount : 1
}]), verifyJwt, updateCoverImage)
export default router;