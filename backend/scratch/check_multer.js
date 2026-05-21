const multerStorage = require("multer-storage-cloudinary");
console.log("Type of multerStorage:", typeof multerStorage);
console.log("multerStorage keys:", Object.keys(multerStorage));
console.log("CloudinaryStorage in multerStorage:", !!multerStorage.CloudinaryStorage);
