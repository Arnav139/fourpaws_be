import express from 'express';
import router from './routes/index';
import dotenv from 'dotenv';
import redisClient from './config/redis';
import postgreDb from './config/dbConfig';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
postgreDb

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})



