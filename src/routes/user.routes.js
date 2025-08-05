import { Router } from "express";
import {userRegister,
    userLogin,
    userLogOut,
    refreshAccessToken,
    upadateUserAvatar,
    upadateUserCoverImage,
    modifyAccountDetails,
    changePassword,
    getCurrentUser,
    getChannelProfile,
    getUserWatchHistory
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"Avatar",
            maxCount:1
        },
        {
            name:"CoverImage",
            maxCount:1
        }]
    )
    ,userRegister);

    router.route("/login").post(userLogin);

    router.route("/logout").post(verifyJWT,userLogOut);

    router.route("/refresh-token").post(refreshAccessToken);

    router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),upadateUserAvatar);

    router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),upadateUserCoverImage);

    router.route("/c/:userName").get(verifyJWT,getChannelProfile);

    router.route("/history").get(verifyJWT,getUserWatchHistory);
    router.route("/current-user").get(verifyJWT,getCurrentUser);
    router.route("/update-password").post(verifyJWT,changePassword);
    router.route("/update-account").patch(verifyJWT,modifyAccountDetails);
export  default router;