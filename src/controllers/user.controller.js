import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import validator from 'validator';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        // console.log(userId);

        const user = await User.findById(userId);
        // console.log(user);

        const accessToken = user.generateAccessToken();
        // console.log("Access token generated:", accessToken);
        const refreshToken = user.generateRefreshToken();
        // console.log("Refresh token generated:", refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({ message: "User registered successfully!" })
    // get user details fromm front end
    // validation of all data fields
    // check if user already exists
    // check for images, check fro avatar
    // upload them on cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullname, username, email, password } = req.body
    // console.log("Request Body:", req.body);

    // if (fullname === "") {
    //     throw new apiError(400, "FullName is required..")
    // }
    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All Fields are required..")
    }

    const isValid = validator.isEmail(email);
    if (!isValid) {
        throw new apiError(400, "Invalid Email");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with Username or email already exists..")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    console.log(avatarLocalPath);
    console.log(coverImageLocalPath);


    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar dose not add in temp folder so Avatar is required..")
    }

    // Initialize variables for image upload
    let avatar, coverImage;

    // Upload images to Cloudinary
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    } catch (error) {
        throw new apiError(500, "Failed to upload images.");
    }

    if (!avatar) {
        throw new apiError(400, "Avatar is required..")
    };

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully..")
    )
});

const loginUser = asyncHandler(async (req, res) => {

    // Get User credentials 
    // check user exist
    // check password match
    // generate access and refresh token 
    // send coookies to user
    // Allow access

    // console.log(req.body);
    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new apiError(400, "Email or username is required..")
    }

    // check user exist or not
    const user = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (!user) {
        throw new apiError(404, "User not found");
    }
    // check password match
    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) {
        throw new apiError(401, "Invalid password");
    }
    // console.log(user);

    // Generate and save a new access and refresh token
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookies to user
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    // remove cookies from user
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "LoggedOut Successfully.."))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized Request..")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new apiError(401, "Invalid Refresh Token..")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newAccessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access Token Refreshed successfully.."
                )
            )
    } catch (error) {
        throw new apiError(401, "Invalid Refreshed Token..")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
