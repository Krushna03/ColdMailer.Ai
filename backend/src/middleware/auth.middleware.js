import  jwt  from 'jsonwebtoken'
import UserModel from '../model/User.models.js'


export const verifyJWT = async (req, _, next) => {
  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
      if (!token) {
        throw new ApiError(401, "Unauthorized request")
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      const account = await UserModel.findById(decodedToken?._id).select("-password -refreshToken");

      if (!account) {
        throw new Error(401, "Invalid access Token at verifyJWT for account")
      }

      req.user = account;       

      next()
    } 
    catch (error) {
      throw new Error(401, error?.message || "Invalid access token")
  }
}