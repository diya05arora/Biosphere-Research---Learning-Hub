import multer from "multer";

// Use memory storage for production (Render) and local development
// This avoids issues with ephemeral filesystems
const storage = multer.memoryStorage();

// Only allow image file types
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});