import express from "express"
import { contact } from "../controller/contact.controller.js";

const router = express()

router.route('/new-contact').post(contact)

export default router;