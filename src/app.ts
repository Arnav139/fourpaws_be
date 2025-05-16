import express from 'express';
import router from './routes/index';
import dotenv from 'dotenv';
import redisClient from './config/redis';
import postgreDb from './config/dbConfig';
import { jwtStrategy } from './config/token';
import passport from "passport";
import cors from "cors"
import { envConfigs } from './config/envconfig';




dotenv.config();

const app = express();
const port = envConfigs.port || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3004", "http://localhost:3001", "https://fourpa.ws/"],
  credentials: true,
}));

passport.use('jwt', jwtStrategy);



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', router);

app.listen(port , () => {
  console.log(`Server is running on http://localhost:${port}`);
})



