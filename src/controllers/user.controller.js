import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Apiresponse } from '../utils/ApiResponse.js';
const userRegister=asyncHandler(async (req,res)=>{
    
    //steps to register user
    //get user data from front end
    //validate the data 
    //check user already  exists or not using email or username
    //get image and avatar
    //upload it to cloudinary
    //get url link from cloudinary
    //create user object and add that entry in mongodb
    //check user created or not
    //remove password and token from response
    //send response to frontend/client

    const {fullname,email,username,password}=req.body;
    console.log("Email: ",email);
    if(
        [fullname,email,username,password].some((field)=>{
            if(field){
                return typeof field !== "string" ||field.trim()==="";
            }
        })
    ){
        throw new ApiError(400,"all fields are required!")
    }
    const existingUser=User.findOne(
        $or [{username},{email}]
    )
    if(existingUser){
        throw new ApiError(409,"user already exists!!!");
    }
    const avatarLocalPath=req.files?.Avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(404,"avatar is required!");
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
         throw new ApiError(404,"avatar is required!");
    }
  const user=await  User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        username:username.toLowerCase(),
        email,
        password 
    });
  const createdUser=await  User.findById(user._id).select(
    "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user!");
    }
    res.status(201).json(
        new Apiresponse(200,"Registerd Successfully",createdUser)
    )
})


export default userRegister;
