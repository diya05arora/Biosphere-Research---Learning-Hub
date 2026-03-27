import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized - User not authenticated");
    }
    
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Access denied - Admin access required");
    }
    
    next();
});