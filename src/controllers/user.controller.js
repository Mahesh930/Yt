import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import validator from 'validator';
import { User } from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"

const registerUser = asyncHandler(async (req, res) => {
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
    console.log("email : ", email);
    console.log("fullname : ", fullname);

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

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with Username or email already exists..")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required..")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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
        new ApiResponce(200, createdUser, "User Registered successfully..")
    )


})

export { registerUser }