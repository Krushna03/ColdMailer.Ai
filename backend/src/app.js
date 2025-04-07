import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"

const app = express()

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
}));

app.use(express.json({ limit: '20kb' }))

app.use(express.urlencoded({ extended: true, limit: '20kb'}))

app.use(express.static('public'))

app.use(cookieParser())


import UserRoute from './routes/user.routes.js'
import EmailRoute from './routes/email.routes.js'
import ContactRoute from './routes/contact.routes.js' 

app.use('/api/v1/user', UserRoute)
app.use('/api/v1/email', EmailRoute)
app.use('/api/v1/contact', ContactRoute)

export { app }


// http://localhost:5000/api/v1/users/register