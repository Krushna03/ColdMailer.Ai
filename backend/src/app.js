import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import helmet from "helmet"
import rateLimit from "express-rate-limit"

const app = express()

app.use(helmet())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
}));

app.use(cors({
  origin: [ process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
}));

app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb'}))
app.use(express.static('public'))
app.use(cookieParser())
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});


import ContactRoute from './routes/contact.routes.js' 
import UserRoute from './routes/user.route.js' 
import EmailRoute from './routes/email.routes.js' 
import PaymentRoute from './routes/payment.routes.js'

app.use('/api/v1/payment', PaymentRoute)
app.use('/api/v1/contact', ContactRoute)
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/email', EmailRoute)

export { app }


// http://localhost:5000/api/v1/users/register