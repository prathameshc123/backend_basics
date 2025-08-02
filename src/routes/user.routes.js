import { Router } from "express";
import {userRegister,userLogin,userLogOut} from "../controllers/user.controller.js";
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
export  default router;