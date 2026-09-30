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

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user?._id,
  });

  if (!video) {
    throw new APIError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});
// findById -> find one document by id => _id
// findOne -> find one document following specific conditions
//    -> Find one video whose _id is videoId AND whose owner is the current user.

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  // 1. Validate video ID
  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "invalid video id");
  }

  // 2. Find the video and verify ownership
  const existingVideo = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!existingVideo) {
    throw new APIError(404, "Video not found");
  }

  // 3. Prepare fields that need to be updated
  const updateDetails = {};

  if (title !== undefined) {
    updateDetails.title = title;
  }

  if (description !== undefined) {
    updateDetails.description = description;
  }

  // 4. Handle thumbnail if a new one was uploaded
  if (req.file) {
    const thumbnailLocalFilePath = req.file?.path;

    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);

    if (!thumbnail) {
      throw new APIError(
        500,
        "something went wrong while uploading the thumbnail"
      );
    }

    updateDetails.thumbnail = thumbnail.url;
  }

  // 5. Make sure there is actually something to update
  if (Object.keys(updateDetails).length === 0) {
    throw new APIError(400, "At least one field is required to update");
  }

  // 6. Update the video
  const updateVideo = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user?._id,
    },
    {
      $set: updateDetails,
    },
    {
      returnDocument: "after",
    }
  );

  // 7. Return updated video
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Video details updated successfully")
    );
});
export { publishAVideo, getVideoById, updateVideo };
