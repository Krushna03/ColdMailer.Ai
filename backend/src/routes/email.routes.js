import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteEmail, generateEmail, getUsageSummary, getUserEmailHistory, updateEmail, updateEmailHistory } from "../controller/email.controller.js";

const router = express.Router()

router.route('/generate-email').post(verifyJWT, generateEmail)

router.route('/update-email').post(verifyJWT, updateEmail)

router.route('/get-user-email-history').get(verifyJWT, getUserEmailHistory)

router.route('/update-email-history').patch(verifyJWT, updateEmailHistory)

router.route('/delete-email').delete(verifyJWT, deleteEmail)

router.route('/usage').get(verifyJWT, getUsageSummary)

export default router;