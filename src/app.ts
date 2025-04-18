import express from 'express';
import router from './routes/index';
import dotenv from 'dotenv';
import redisClient from './config/redis';
import postgreDb from './config/dbConfig';
import { jwtStrategy } from './config/token';
import passport from "passport";
import cors from "cors"




dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*"}));
passport.use('jwt', jwtStrategy);



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', router);

app.listen(3000, '0.0.0.0' , () => {
  console.log(`Server is running on http://localhost:${3000}`);
})



