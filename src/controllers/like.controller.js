import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }

  const likedBy = req.user._id;
  const video = videoId;

  // Check if video exists could be added here for stricter validaton

  const like = await Like.findOne({ video, likedBy });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  }

  await Like.create({ video, likedBy });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }

  const likedBy = req.user._id;
  const comment = commentId;

  const like = await Like.findOne({ comment, likedBy });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  }

  await Like.create({ comment, likedBy });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID");
  }

  const likedBy = req.user._id;
  const tweet = tweetId;

  const like = await Like.findOne({ tweet, likedBy });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  }

  await Like.create({ tweet, likedBy });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedBy = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(likedBy),
        video: { $exists: true }
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    },
    {
      $unwind: "$video"
    },
    {
      $project: {
        video: 1
      }
    },
    {
      $replaceRoot: { newRoot: "$video" }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      likedVideos,
      "Liked videos fetched successfully"
    ))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
