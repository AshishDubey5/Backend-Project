import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

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

  // if (fullName === "") {
  //   throw new APIError(400, "fullname is required");
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }
});

export { registerUser };
