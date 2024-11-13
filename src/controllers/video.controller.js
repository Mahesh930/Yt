import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new apiError(400, "Video is Missing..")
    }
    if (!thumbnailLocalPath) {
        throw new apiError(400, "Video thumbnail is Missing..")
    }
    let videoUrl, thumbnailUrl;
    try {
        videoUrl = await uploadOnCloudinary(videoLocalPath);
        thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

    } catch (error) {
        throw new apiError(400, "Faield to upload finles on cloudinary..");

    }

    if (!videoUrl.url) {
        throw new apiError(400, "Failed to Upload video On Cloudinary")
    }
    if (!videoUrl.url) {
        throw new apiError(400, "Failed to Upload video thumbnail On Cloudinary")
    }

    const video = await Video.create({
        videoFile: videoUrl.url,
        thumbnail: thumbnailUrl.url,
        title,
        description,
        duration,
        userId: req.user._id
    })

    const createdVideo = await Video.findById(video._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdVideo,
                "Video Published.."
            )
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video Not Found..")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video Found.."
            )
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video Not Found..")
    }

    const updatedVideo = await Video.findByIdAndUpdate({
        _id: videoId
        
    })

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            "Video Deleted..",
        ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}