import { OAuth2Client } from 'google-auth-library';
import UserModel from '../model/User.models.js';
import bcrypt from "bcryptjs"


const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await UserModel.findById(userID)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false}) 

    return {accessToken, refreshToken}

  } catch (error) {
    return res.status(500).json(
      {
        success: false,
        message: 'Error while generating access & refresh token, please try again.',
      }
    );
  }
}



const client = new OAuth2Client('296248819606-0bule3v4ta7cqqbvmdcen5a70ammpepv.apps.googleusercontent.com');

const verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.query;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '296248819606-0bule3v4ta7cqqbvmdcen5a70ammpepv.apps.googleusercontent.com'
    });
    
    const payload = ticket.getPayload();

    let user = await UserModel.findOne({ email: payload.email });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

      user = await UserModel.create({
        username: payload.name,
        email: payload.email,
        password: hashedPassword,
        authProvider: 'google'
      });
    }
    
    const {accessToken} = await generateAccessAndRefreshTokens(user?._id)

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    }

    return res.status(200)
          .cookie('accessToken', accessToken, options)
          .json({
            success: true,
            token: accessToken,
            data: { user }
      });
  } 
    catch (error) {
      console.error('Google Auth Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate with Google'
      });
  }
};

export { verifyGoogleToken };