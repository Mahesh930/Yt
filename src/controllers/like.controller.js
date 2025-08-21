import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const likedBy = req.user._id;
  const video = videoId;
  const like = await Like.findOne({ video, likedBy });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res.json(new ApiResponse({ message: "Video unliked" }));
  }

  const lvid = await Like.create({ video, likedBy });
  const createdLiked = await Like.findById(lvid._id);
  console.log("hello");
  return res
    .status(201)
    .json(new ApiResponse(200, { like: lvid }, "Video liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  // get comment ID from params
  // get user ID from req.user
  // check if like exists
  // if like exists, delete like
  // if like does not exist, create like
  // return response

  const { commentId } = req.params;
  //TODO: toggle like on comment
  const { content, videoId } = req.body;

  const comment = await Comment.findById({ _id: commentId });
  if (!comment) {
    throw apiError(404, "Comment not found");
  }
  try {

    const likedBy = req.user._id;
    // const comment = commentId;
    const like = await Like.findOne({ comment, likedBy });
    if (like) {
      await Like.findByIdAndDelete(like._id);
      return res.json(new ApiResponse({ message: "Comment unliked" }));
    }

    const lcid = await Like.create({ comment, likedBy });

    return res
      .status(201)
      .json(new ApiResponse(200, { like: lcid }, "Comment liked"));

  } catch (error) {
    // console.log(error);
    return res.json(new ApiResponse(400, {}, "Error"));

  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  // get tweet ID from params
  // get user ID from req.user
  // check if like exists
  // if like exists, delete like
  // if like does not exist, create like
  // return response
  const { tweetId } = req.params;
  const likedBy = req.user._id;
  const tweet = tweetId;

  const like = await Like.findOne({ tweet, likedBy });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res.json(new ApiResponse({ message: "Tweet unliked" }));
  }

  const newLike = await Like.create({ tweet, likedBy });
  return res.status(200)
    .json(new ApiResponse(200, { like: newLike }, "Tweet liked"));

});

const getLikedVideos = asyncHandler(async (req, res) => {
  // get user ID
  // get all likes by user ID
  // get all videos by like ID
  // return videos

  //TODO: get all liked videos
  const likedBy = req.user._id;
  const likes = await Like.find({ likedBy }).populate("video");
  const videos = likes.map((like) => like.video);
  return res.json(new ApiResponse(200, { videos }, "Liked videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
