import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // steps
  /*
    1-> get the content from req.body
    2-> validate the content length
    3-> create an object and then entry in db
    4-> Return response
    */
  const { content } = req.body;

  if (!content) {
    throw new APIError(400, "Tweet content is empty");
  }

  if (content.length > 200) {
    throw new APIError(400, "Tweet must be 200 characters or fewer");
  }

  const tweet = Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created Successfully"));
});

// const getUserTweets = asyncHandler(async (req, res) => {
//   // TODO: get user tweets
// });

// const updateTweet = asyncHandler(async (req, res) => {
//   //TODO: update tweet
// });

// const deleteTweet = asyncHandler(async (req, res) => {
//   //TODO: delete tweet
// });

export {
  createTweet,
  // , getUserTweets, updateTweet, deleteTweet
};
