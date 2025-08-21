import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const { page = 1, limit = 10 } = req.query;
  // console.log(videoId)
  if (!videoId) {
    return apiError(res, 400, "Video is required...");
  }
  
  const video = await Video.findById(videoId);
  if (!video) {
    return apiError(res, 404, "Video not found.");
  }

  const comments = await Comment.find({ video: video._id })
    .populate("owner", "username") 
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  if (!comments || comments.length === 0) {
    return apiError(res, 404, "No comments found for this video.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { comments }, "All comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId, content } = req.body;
  const commentBy = req.user._id;
  // console.log("in addComment controller");
  // console.log(videoId, content);

  if (!videoId || !content) {
    return apiError(res, 400, "VideoID and Content are required !!");
  }

  const videoExists = await Video.findById(videoId);
  // console.log(videoExists);

  if (!videoExists) {
    return apiError(res, 404, "Video not found.");
  }

  let comment = await Comment.create({
    video: videoId,
    owner: commentBy,
    content,
  });
  // console.log(comment);
  const newCmt = await Comment.findById(comment._id);
  console.log(newCmt);

  return res
    .status(201)
    .json(new ApiResponse(200, { comment: comment }, "Commented.."));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { id } = req.params;
  const content = req.body;
  const user = req.user._id;

  if (!id) {
    return apiError(res, 400, "Coment id required");
  }

  const oldComment = await Comment.findById({ _id: id });
  if (oldComment.owner.toString() !== user.toString()) {
    return apiError(res, 400, "You are not authorized to Update this comment.");
  }
  const newComment = content;
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const user = req.user._id;
  if (!commentId) {
    return apiError(res, 400, "Invalid CommentID..");
  }

  let comment = await Comment.findById(commentId);
  //   console.log(comment)
  if (!comment) {
    return apiError(res, 404, "Comment not found.");
  }
  if (comment.owner.toString() !== user.toString()) {
    return apiError(res, 403, "You are not authorized to delete this comment.");
  }
  let delComment = await Comment.findOneAndDelete({ _id: commentId });

  console.log(comment);
  console.log(delComment);

  return res
    .status(201)
    .json(new ApiResponse(200, { comment: delComment }, "Delete Comment.."));
});

export { getVideoComments, addComment, updateComment, deleteComment };
