const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ✅ It reads from process.env.CLOUDINARY_...
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'e_fashion_mela', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'avif'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
    },
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload,
};