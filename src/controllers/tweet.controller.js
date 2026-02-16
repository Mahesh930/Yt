import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if (!tweet) {
        throw new apiError(500, "Failed to create tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    if (!content) {
        throw new apiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(403, "You are not authorized to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}