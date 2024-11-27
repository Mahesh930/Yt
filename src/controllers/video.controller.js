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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Fetch the video from the database
        const video = await Video.findById(videoId);

        // If video not found, return 404 error
        if (!video) {
            return res.status(404).json({
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

// const updateVideo = asyncHandler(async (req, res) => {
//     // const {  } = req.params
//     const { title, description, videoId } = req.body
//     //TODO: update video details like title, description, thumbnail
//     const video = await Video.findById(videoId)
//     if (!video) {
//         throw new apiError(404, "Video Not Found..")
//     }
//     // Validate other fields
//     if (!title || !description) {
//         throw new apiError(400, "Title and Description are required");
//     }
//     // console.log('Files:', req.files);
//     // console.log('Body:', req.body);

//     const localThumbnailPath = req.files?.thumbnail?.[0]?.path;
//     if (!localThumbnailPath) {
//         throw new apiError(400, "Thumbnail is required ");
//     }

//     // upload thumbnail on cloudinary 
//     let newThumbnail;
//     try {
//         newThumbnail = await uploadOnCloudinary(localThumbnailPath);
//     } catch (error) {
//         console.error('Cloudinary Upload Error:', error);
//         throw new apiError(500, "Thumbnail Upload Failed");
//     }

//     // update video details
//     const updatedVideo = await Video.findOneAndUpdate(
//         { _id: videoId },
//         {
//             $set: {
//                 title: title,
//                 description: description,
//                 thumbnail: newThumbnail

//             }
//         }
//     )
//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             updatedVideo,
//             "Video Updated.."
//         ))

// })
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
        throw new apiError(400, 'Title and description are required');
    }

    // Find the video
    const video = await Video.findById(videoId);
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


    // Update the video details
    const updatedFields = {
        title,
        description,
        ...(newThumbnail && { thumbnail: newThumbnail }), // Only update thumbnail if provided
    };

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatedFields },
        { new: true } // Return updated document
    );

    return res
    .status(200)
    .json(new ApiResponse(
        200, updatedVideo, 'Video Updated Successfully'
    ));
});


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