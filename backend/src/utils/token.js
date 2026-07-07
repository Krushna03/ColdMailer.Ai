import UserModel from "../model/User.models.js";

const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await UserModel.findById(userID)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Something went wrong while generating tokens.");
  }
}

export { generateAccessAndRefreshTokens };
