import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const EmailSchema = new Schema({
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now()
    }
})



const UserSchema = new Schema({
    username: {
      type: String,
      required: [true, "Username is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      , "Please use valid email"]
    },

    password: {
      type: String ,
      required: [true, "Password is required"],
    },
    
    authProvider: {
      type: String,
      default: null
    },

    refreshToken: {
      type: String,
      default: null
    },
    
    genereatedEmails: [EmailSchema]
  }, 
  { timestamps: true }
)


UserSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10)
  next()
})


UserSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}


UserSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
      process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}


UserSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


const UserModel = mongoose.model("User", UserSchema)

export default UserModel;
