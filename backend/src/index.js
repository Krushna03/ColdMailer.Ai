import './loadEnv.js';
import { app } from './app.js'
import connectDB from './database/db.js'
import { OAuth2Client } from 'google-auth-library';

export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.get('/', (req, res) => {
  res.send('Hello');
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at Port : http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('MongoDBconnection failed !!!', error)
  })

export default app