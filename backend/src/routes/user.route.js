import express from "express"
import { currentUser, getUserCount, login, logoutUser, register } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verifyGoogleToken } from "../controller/google.auth.controller.js"
import { validateRegister, validateLogin } from "../utils/Zod-Validations/User.validations.js"

const router = express.Router()

router.route("/register").post(validateRegister, register)

router.route("/login").post(validateLogin, login)

router.route('/getCurrentUser').get(verifyJWT, currentUser)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/google/callback').get(verifyGoogleToken);

router.route('/get-user-count').get(getUserCount);


export default router;