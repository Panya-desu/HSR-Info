const cloudinary = require("cloudinary").v2;
const multerStorage = require("multer-storage-cloudinary");
const CloudinaryStorage = multerStorage.CloudinaryStorage || multerStorage;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary Configured:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "YES" : "MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "YES" : "MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "YES" : "MISSING",
});

// Ping Cloudinary to verify connection
cloudinary.api.ping()
    .then(result => console.log("Cloudinary Connection OK:", result))
    .catch(err => console.error("Cloudinary Connection FAILED:", err.message));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const axios = require("axios");
const crypto = require("crypto");

// Manual upload helper (Axios version - More reliable than SDK for small files/icons)
const uploadToCloudinary = async (buffer, folder = "hsr-characters", mimetype = "image/png") => {
    try {
        const sizeKB = Math.round(buffer.length / 1024);
        console.log(`Starting Direct Axios upload to Cloudinary... (Size: ${sizeKB} KB)`);

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const timestamp = Math.round(new Date().getTime() / 1000);

        // 1. Prepare signature
        const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        // 2. Prepare Form Data
        const base64Image = `data:${mimetype};base64,${buffer.toString('base64')}`;
        
        const params = new URLSearchParams();
        params.append("file", base64Image);
        params.append("api_key", apiKey);
        params.append("timestamp", timestamp);
        params.append("folder", folder);
        params.append("signature", signature);

        // 3. POST Request
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            params,
            { 
                timeout: 30000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity 
            }
        );

        console.log("Direct Upload Success:", response.data.secure_url);
        return response.data;

    } catch (error) {
        console.error("Direct Upload Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { cloudinary, upload, uploadToCloudinary };