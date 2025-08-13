import { Router } from 'express';
import {
    updateVideo,
    uploadVideo,
    getAllVideos,
    togglePublishStatus,
    publishVideo,
    deleteVideo,
    getVideoById
} from "../controllers/video.controller.js";
import upload from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router=Router();

router.use(verifyJWT);

router.route("/upload-video").post(upload.single("videoFile"),uploadVideo);

export default router;