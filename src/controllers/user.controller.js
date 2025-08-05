import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
const {ObjectId}=mongoose.Types;
//import Subscription from "../models/subsription.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//import { mongo } from "mongoose";
//import cookieParser from 'cookie-parser';
const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateaccesstoken();
    const refreshToken = await user.generaterefreshtoken();
    // const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found in token generator");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens!"
    );
  }
};

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  const parts = url.split("/"); // split by slashes
  const filename = parts.pop(); // get last part: "abc123.jpg"
  const publicId = filename.split(".")[0]; // remove file extension

  return publicId; // returns "abc123"
};

export const userRegister = asyncHandler(async (req, res) => {
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

  if (
    [fullName, Email, userName, password].some((field) => {
      if (field) {
        return typeof field !== "string" || field.trim() === "";
      }
    })
  ) {
    throw new ApiError(400, "all fields are required!");
  }
  const existingUser = await User.findOne({
    $or: [{ userName }, { Email }],
  });
  if (existingUser) {
    throw new ApiError(409, "user already exists!!!");
  }
  const avatarLocalPath = req.files?.Avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.CoverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(404, "avatar is required!");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(404, "avatar is required!");
  }
  const user = await User.create({
    fullName,
    Avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    Email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user!");
  }
  res
    .status(201)
    .json(new Apiresponse(200, "Registerd Successfully", createdUser));
});

export const userLogin = asyncHandler(async (req, res) => {
  //take user data like username/email & password for validation
  //find use
  //validate password
  //generate refresh and access token
  //send cookies

  const { userName, Email, password } = req.body;
  if (!Email && !userName) {
    throw new ApiError(404, "username or email is mandatory!");
  }
  const user = await User.findOne({
    $or: [{ Email }, { userName }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exists!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "invalid password!");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        {
          user: loggedInuser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully!"
      )
    );
});

export const userLogOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "user logged out"));
});
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "invalid refresh token");
  }
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "refresh token used or expired");
  }

  const { accessToken, newRefreshToken } = await generateAccessandRefreshTokens(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new Apiresponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "access token refreshed"
      )
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const validatePassword = await user.isPasswordCorrect(oldPassword );
  if (!validatePassword) {
    throw new ApiError(400, "invalid password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new Apiresponse(200, {}, "password changed successfully"));
});
export const getCurrentUser = asyncHandler(async (req, res) => {
  if(!req.user){
    throw new ApiError(400,"user not logged in");
  }
  res.json(new Apiresponse(200, req.user, "current user fetched successfully"));
});

export const modifyAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, Email } = req.body;
  if (!fullName || !Email) {
    throw new ApiError(
      400,
      "provide all valid fields for account modification"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        Email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res.json(new Apiresponse(200, user, "account details updated"));
});

export const upadateUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  const existingavatar = user.avatar;
  if (!existingavatar) {
    throw new ApiError(
      400,
      "something went wrong while accessing exisitng avatar"
    );
  }
  const oldPublicID = extractPublicIdFromUrl(existingavatar);
  await deleteFromCloudinary(oldPublicID);

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file not provided");
  }
  const newavatar = await uploadOnCloudinary(avatarLocalPath);
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: newavatar.url,
      },
    },
    { new: true }
  ).select("-password");

  res.json(new Apiresponse(200, updatedUser, "avatar updated successfully"));
});

export const upadateUserCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  const existingCoverImage = user.coverImage;
  if (user?.coverImage) {
    const oldPublicID = extractPublicIdFromUrl(user.coverImage);
    if (oldPublicID) {
      await deleteFromCloudinary(oldPublicID);
    }
  }

  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file not provided");
  }
  const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: newCoverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  res.json(
    new Apiresponse(200, updatedUser, "cover image updated successfully")
  );
});

export const getChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        isSubscribed: 1,
        Email: 1,
        subscribedToCount: 1,
        subscribersCount: 1,
        coverImage: 1,
        avatar: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "channel not exists");
  }

  res
    .status(200)
    .json(
      new Apiresponse(200, channel[0], "user channel fetched successfully")
    );
});

export const getUserWatchHistory = asyncHandler(async (req, res) => {
const id=req.user?._id;
if(!mongoose.Types.ObjectId.isValid(id)){
  throw new ApiError(400,"user not logged in");
}

  const objectId = new mongoose.Types.ObjectId(id); // Safe now

  const user = await User.aggregate([
    {
      $match: {
        _id: objectId
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline:[
                {
                    $project:{
                        fullName:1,
                        userName:1,
                        avatar:1
                    }
                }
              ]
            },
          },
          {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
          }
        ],
      },
    },
  ]);
  res.json(
    new Apiresponse(200, user[0]?.watchHistory || [], "Watch history fetched successfully")
  )
});
