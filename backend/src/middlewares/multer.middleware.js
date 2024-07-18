const multer = require("multer");

// Common Storage Configuration for both images and videos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, "./src/uploads/images"); // Destination folder for images
        } else if (file.mimetype.startsWith("video")) {
            cb(null, "./src/uploads/videos"); // Destination folder for videos
        } else {
            cb(new Error("File type not supported"), false); // Reject unsupported file types
        }
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Filename format
    },
});

// Common File Filter for both images and videos
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image") ||
        file.mimetype.startsWith("video")
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only images and videos are allowed"), false); // Reject the file
    }
};

// Initialize Multer Instance
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = {
    upload,
};
