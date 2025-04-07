import { GoogleGenerativeAI } from "@google/generative-ai";
import { app } from './app.js'
import dotenv from 'dotenv'
import connectDB from './databse/db.js'

dotenv.config({
  path: "./.env"
})


const geminiapiKey = process.env.GEMINIAPIKEY;
const genAI = new GoogleGenerativeAI(geminiapiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.3,
  }
});


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () =>{
      console.log(`Server is running at Port : ${process.env.PORT}`);
    })

    app.on("error" , (error) => {
    console.log('App error at app.on', error);
    throw error
    })
  })
.catch((error) => {
  console.log('MongoDBconnection failed !!!' , error);
})


app.get('/', (req, res) => {
  res.send('Hello');
});