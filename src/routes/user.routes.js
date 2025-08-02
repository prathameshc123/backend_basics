import { Router } from "express";
import {userRegister,userLogin,userLogOut,refreshAccessToken} from "../controllers/user.controller.js";
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
export  default router;