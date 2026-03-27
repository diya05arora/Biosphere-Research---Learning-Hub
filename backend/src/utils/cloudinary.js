import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import { ApiError } from './ApiError.js';
import { Readable } from 'stream';

dotenv.config();

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (filePathOrBuffer) => {
    try {
        if (!filePathOrBuffer) {
            return null;
        }

        // Handle both file path (disk storage) and buffer (memory storage)
        if (typeof filePathOrBuffer === 'string') {
            // File path from disk storage
            const response = await cloudinary.uploader.upload(
                filePathOrBuffer, {
                    resource_type: "auto"
                }
            )
            return response;
        } else if (Buffer.isBuffer(filePathOrBuffer)) {
            // Buffer from memory storage
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                Readable.from(filePathOrBuffer).pipe(uploadStream);
            });
        } else {
            return null;
        }
    } catch(error) {
        throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}