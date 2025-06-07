import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  origin: [ process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
}));

app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb'}))
app.use(express.static('public'))
app.use(cookieParser())

import ContactRoute from './routes/contact.routes.js' 
import UserRoute from './routes/user.route.js' 
import EmailRoute from './routes/email.routes.js' 

app.use('/api/v1/contact', ContactRoute)
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/email', EmailRoute)

export { app }


// http://localhost:5000/api/v1/users/register