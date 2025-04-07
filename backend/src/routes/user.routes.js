import express from "express"
import { currentUser, login, logoutUser, register } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import passport from "passport"
import jwt from "jsonwebtoken"
import { verifyGoogleToken } from "../controller/google.auth.controller.js"

const router = express()

router.route("/register").post(register)

router.route("/login").post(login)

router.route('/getCurrentUser').get(verifyJWT, currentUser)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/google/callback').get(verifyGoogleToken);


export default router;