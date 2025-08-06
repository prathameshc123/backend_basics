import {Video} from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Apiresponse } from "../utils/ApiResponse.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
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