import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.CLOUDINARY_URL) {
  try {
    const urlStr = process.env.CLOUDINARY_URL;
    if (urlStr.startsWith('cloudinary://')) {
      const remaining = urlStr.slice('cloudinary://'.length);
      const [credentials, cloudName] = remaining.split('@');
      const [apiKey, apiSecret] = credentials.split(':');
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
      console.log(`[Cloudinary Config] Configured successfully from URL. Cloud Name: ${cloudName}`);
    } else {
      cloudinary.config();
      console.log('[Cloudinary Config] Configured using auto-lookup of CLOUDINARY_URL.');
    }
  } catch (err) {
    console.error('[Cloudinary Config Error] Failed to parse CLOUDINARY_URL, falling back:', err);
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log(`[Cloudinary Config] Configured using individual variables. Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
}

export default cloudinary;
