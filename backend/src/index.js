import './loadEnv.js';
import { app } from './app.js'
import connectDB from './database/db.js'
import { client } from './config/google-client.js';

export { client };

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