const cloudinary = require('cloudinary').v2;   // an online storage specifically for images. Has certian functionality that is usefule for images such as cropping, compressing etc.
const { CloudinaryStorage } = require('multer-storage-cloudinary');  // This is an npm that helps us use multer and cloudinary together

// all in .env file. .env must be in base level.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_KEY,
api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

module.exports = {
  cloudinary,
  storage
}
