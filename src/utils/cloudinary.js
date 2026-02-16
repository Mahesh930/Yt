import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration for Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    // console.log("Uploading file:", localFilePath); // Log the file path being uploaded

    try {
        if (!localFilePath) {
            // console.error("No file path provided for upload."); // Log error if no path
            return null;
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically determine the resource type
        });

        // Log success message and response from Cloudinary
        // console.log("File uploaded successfully on Cloudinary!");
        // console.log(response);

        // Delete the file from the local machine after successful upload
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error); // Log the error
        if (fs.existsSync(localFilePath)) {
            // Ensure the file exists before trying to delete
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        }
        return null; // Return null on error
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        //destroy the file on cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        });

        return response;

    } catch (error) {
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
