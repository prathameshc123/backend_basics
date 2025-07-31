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

   
    const { fullName, Email, userName, password } = req.body;

    if(
        [fullName,Email,userName,password].some((field)=>{
            if(field){
                return typeof field !== "string" ||field.trim()==="";
            }
        })
    ){
        throw new ApiError(400,"all fields are required!")
    }
    const existingUser= await User.findOne({
         $or: [{userName},{Email}]
    }
       
    )
    if(existingUser){
        throw new ApiError(409,"user already exists!!!");
    }
const avatarLocalPath = req.files?.Avatar?.[0]?.path;
const coverImageLocalPath = req.files?.CoverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(404,"avatar is required!");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
         throw new ApiError(404,"avatar is required!");
    }
  const user=await  User.create({
        fullName,
        Avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        userName:userName.toLowerCase(),
        Email,
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
