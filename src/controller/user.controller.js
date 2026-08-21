import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "message changed",
  });

  // Steps nedded to register user (Assignment)
  /* Get user details from frontend
   Validation - not empty
   Check if user already exist: username, email
   Check for images, check for avatar
   Upload them to cloudinary, avatar
   Create user object - create entry in db
   Remove password and refresh token field from response
   Check for user creation
   Return response
   */

  console.log("registerUser called");

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  /* if (fullName === "") {
    throw new APIError(400, "fullname is required");
  }
  */

  // Validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }

  // Check if username or email already exist or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // User.findOne() returns a Mongoose Query object.
  // And Query object is truthy, will always execute, even when the user doesn't exist.
  console.log("Existing user:", existedUser);

  if (existedUser) {
    throw new APIError(409, "User with email or username already exist");
  }

  // Check for image/avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is required");
  }

  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new APIError(400, "Avatar file is required");
  }

  // Create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
