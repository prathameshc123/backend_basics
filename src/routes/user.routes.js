import { Router } from "express";
import userRegister from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlewares.js";
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
export  default router;