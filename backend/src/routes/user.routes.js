import express from "express"
import { currentUser, login, logoutUser, register } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = express()

router.route("/register").post(register)

router.route("/login").post(login)

router.route('/getCurrentUser').get(verifyJWT, currentUser)

router.route('/logout').post(verifyJWT, logoutUser)

export default router;