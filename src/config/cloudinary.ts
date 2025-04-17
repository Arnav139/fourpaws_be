import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { envConfigs } from './envconfig';

dotenv.config();

cloudinary.config({
  cloud_name: envConfigs.cloudinaryCloudName,
  api_key: envConfigs.cloudinaryApiKey,
  api_secret: envConfigs.cloudinaryApiSecret
});

export default cloudinary;
