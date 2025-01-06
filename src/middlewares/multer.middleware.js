import multer from "multer";
import path from "path";

// Configure disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "public/temp")); // Ensure directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname); // Avoid name conflicts
    }
});

// Create the upload middleware
export const upload = multer({
    storage,
});

