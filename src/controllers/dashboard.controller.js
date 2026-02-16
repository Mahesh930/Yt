import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    const totalVideos = await Video.countDocuments({ owner: userId });

    const totalViewsResult = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    const totalLikesResult = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalLikes"
        }
    ]);
    const totalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        ));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;

    const videos = await Video.find({ owner: userId });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        ))
})

export {
    getChannelStats,
    getChannelVideos
}