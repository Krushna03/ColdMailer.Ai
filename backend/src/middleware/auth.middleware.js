import  jwt  from 'jsonwebtoken'
import UserModel from '../model/User.models.js'


export const verifyJWT = async (req, res, next) => {
  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
      if (!token) {
        return res.json(
          {
            success: false,
            message: 'Unauthorized request',
          },
          { status: 500 }
        );
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      const account = await UserModel.findById(decodedToken?._id).select("-password -refreshToken");

      if (!account) {
        return res.json(
          {
            success: false,
            message: 'Invalid access Token at verifyJWT for account',
          },
          { status: 500 }
        );
      }

      req.user = account;       

      next()
    } 
    catch (error) {
      return res.json(
        {
          success: false,
          message: error?.message || "Invalid access token",
        },
        { status: 500 }
      );
  }
}