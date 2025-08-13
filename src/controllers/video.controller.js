import {Video} from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {getVideoDurationInSeconds} from  'get-video-duration';
import { deleteFromCloudinary,uploadOnCloudinary } from "../utils/cloudinary.js";
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})
const uploadVideo=asyncHandler(async(req,res)=>{
    const{title,description}=req.body;
    if(!title || !description){
    throw new ApiError(400,"video details are missing")
}
const videopath=req.file?.path;
if(!videopath){
    throw new ApiError(400,"video file missing")
}

const videourl=await uploadOnCloudinary(videopath);
if(!videourl?.url){
    throw new ApiError(400,"cloudinary upload failed")
}
const vid_dur=await getVideoDurationInSeconds(videourl.url);
const video=await Video.create({
    videoFile:videourl.url,
    title,
    description,
    duration:vid_dur,
    owner:req.user._id
})

if(!video){
    throw new ApiError(400,"something went wrong while uploading video");
}
res.json(new Apiresponse(200,video,"video uploaded successfully"));
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId){
        throw new ApiError(400,"videoid missing");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found");
    }
    res.status(200)
    .json(
        new Apiresponse(200,video,"video fetched successfully")
    )
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description, thumbnail}=req.body;
    if(!title && !description && !thumbnail){
        throw new ApiError("not a single detail to update ")
    }
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"videoid missing");
    }
    const updateDetails={};
    if(title)updateDetails.title=title;
    if(thumbnail)updateDetails.thumbnail=thumbnail;
    if(description)updateDetails.description=description;
    const video=await Video.findByIdAndUpdate(videoId,{
        $set:updateDetails
    },{
        new:true
    })
    if(!video){
        throw new ApiError(404,"video not found");
    }

    res.json(new Apiresponse(200,video,"video details updated successfully"));
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(404,"video id missing");
    }

    const deletedVideo=await Video.findByIdAndDelete(videoId).select("title description");
    if(!deletedVideo){
        throw new ApiError(404,"invalid videoId");
    }
    res.json(
        new Apiresponse(200,deletedVideo,"video deleted successfully")
    )
})
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(404,"videoID missing");
    }

    const video=await Video.findById(videoId)
       

    if(!video){
        throw new ApiError(400,"video file is missing")
    }
    video.ispublished=!video.ispublished;
    await video.save();
    res.json(
        new Apiresponse(200,video,"video publish status toggled")
    );
})
const publishVideo=asyncHandler(async(req,res)=>{
const videoid=req.params;
if(!videoid){
    throw new ApiError("invalid videoid");
}
const video=await Video.findById(videoid);
video.ispublished=true;
await video.save();
res.json(
    new Apiresponse(200,video,"video published successfully")
)

})
export{
    uploadVideo,
    getAllVideos,
    updateVideo,
    getVideoById,
    deleteVideo,
    publishVideo,
    togglePublishStatus,

}