import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

//this function run successfully
const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const { page = 1, limit = 10, query, sortBy = 'uploadedAt', sortType = 'desc', userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    try {
        const searchQuery = {};
        if (query) searchQuery.title = { $regex: query, $options: 'i' }; // Case-insensitive text search
        if (userId) searchQuery.userId = userId; // Filter by user ID
    
        const skip = (page - 1) * limit;
        const sortOrder = sortType === 'asc' ? 1 : -1;
    
        const videos = await Video.find(searchQuery)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(Number(limit));
    
        const totalVideos = await Video.countDocuments(searchQuery);
        res.status(200).json({
          data: videos,
          meta: {
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
            totalVideos,
          },
        });

        return res.status(200).json(new ApiResponse(200, videos, "All Videos"));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

//this function run successfully
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;

    // Validate video and thumbnail files
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new apiError(400, "Video is missing.");
    }
    if (!thumbnailLocalPath) {
        throw new apiError(400, "Video thumbnail is missing.");
    }

    let videoUrl, thumbnailUrl;
    try {
        videoUrl = await uploadOnCloudinary(videoLocalPath);
        thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

        if (!videoUrl.url) {
            throw new apiError(400, "Failed to upload video on Cloudinary.");
        }
        if (!thumbnailUrl.url) {
            throw new apiError(400, "Failed to upload video thumbnail on Cloudinary.");
        }
    } catch (error) {
        // Optionally clean up local files on failure
        fs.unlinkSync(videoLocalPath); // Ensure to import 'fs' at the top
        fs.unlinkSync(thumbnailLocalPath);
        throw new apiError(500, "Failed to upload files on Cloudinary.");
    }

    // Create video entry in the database
    const video = await Video.create({
        videoFile: videoUrl.url,
        thumbnail: thumbnailUrl.url,
        title,
        description,
        duration,
        userId: req.user._id,
    });

    const createdVideo = await Video.findById(video._id);

    return res.status(200).json(
        new ApiResponse(200, createdVideo, "Video published successfully.")
    );
});

//this function run successfully
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Fetch the video from the database
        const video = await Video.findOne(videoId);

        // If video not found, return 404 error
        if (!video) {
            return res
                .status(404)
                .json({
                    status: 404,
                    message: "Video not found",
                });
        }

        // Return the video if found
        return res.status(200).json(
            new ApiResponse(200, video, "Video found")
        );
    } catch (error) {
        // Log error and return server error response
        console.error("Error fetching video:", error.message);

        return res.status(500).json({
            status: 500,
            message: "Server error",
        });
    }
});

//this function run successfully
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
        throw new apiError(400, 'Title and description are required');
    }

    // Find the video
    const video = await Video.findOne(videoId);
    if (!video) {
        throw new apiError(404, 'Video Not Found');
    }

    // Handle thumbnail upload
    let newThumbnail;
    try {
        newThumbnail = await uploadOnCloudinary(req.file?.path);
    } catch (error) {
        throw new apiError(500, 'Thumbnail Upload Failed');
    }

    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId },
        {
            $set: {
                title: title,
                description: description,
                thumbnail: newThumbnail.url

            }
        }
    )
    // console.log(updateVideo);
    return res
        .status(200)
        .json(new ApiResponse(
            200, updatedVideo, 'Video Updated Successfully'
        ));
});
//this function run successfully
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
});

//this function run successfully
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle publish status of video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, 'Video Not Found');
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            'Video Publish Status Toggled'
        ))
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}