import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { generateEmail, updateEmail } from "../controller/email.controller.js";

const router = express()

router.route('/generate-email').post(verifyJWT, generateEmail)

router.route('/update-email').post(verifyJWT, updateEmail)

export default router;