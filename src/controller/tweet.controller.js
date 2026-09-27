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

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user id");
  }

  const tweets = await Tweet.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets feched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  // steps
  /*
    1-> get the user from req.params
    2-> get the tweets 
    2-> validate the content length
    3-> create an object and then entry in db
    4-> Return response
    */

  const { tweetId } = req.params;
  const { content } = req.body;

  // Check if tweetId is a valid MongoDB ObjectId
  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }

  // Check if content is provided
  if (!content?.trim()) {
    throw new APIError(400, "Content is required");
  }

  // Find and update the tweet
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  // Check if tweet exists
  if (!tweet) {
    throw new APIError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //   //TODO: delete tweet
  /*STEPS
  1-> get the tweet id.
  2-> find the tweet.
  3-> verify tweet belongs to req.user.
  4-> Delete.
  */

  const { tweetId } = req.params;

  const delTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });
  if (!delTweet) {
    throw new APIError(404, "tweet is not available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, delTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
