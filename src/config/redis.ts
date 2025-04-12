import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = new Redis(
  // host: process.env.REDIS_HOST || 'localhost',
  // port: parseInt(process.env.REDIS_PORT || '6379'), for development usage
  process.env.REDIS_URL,{
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => console.log('Connected to Redis'));
redisConnection.on('error', (err) => console.error('Redis Error:', err));

export default redisConnection;