import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new APIError(400, "Title and description are required");
  }

  // Validate uploaded files
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new APIError(400, "video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new APIError(400, "thumbnail file is required");
  }

  // Upload on Cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new APIError(400, "Video file upload failed");
  }
  if (!thumbnail) {
    throw new APIError(400, "Thumbnail upload failed");
  }

  // Create video document with duration from Cloudinary
  const createVideo = await Video.create({
    title,
    description,
    duration: video.duration,
    thumbnail: thumbnail.url,
    videoFile: video.url,
    owner: req.user?._id,
  });

  if (!createVideo) {
    throw new APIError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createVideo, "Video uploaded successfully"));
});

export { publishAVideo };
