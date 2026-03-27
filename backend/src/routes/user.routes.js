import { Router } from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, deleteUserAccount} from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

// Strict rate limiting for authentication endpoints only
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for non-auth endpoints
        const authPaths = ["/login", "/register", "/create-admin", "/refresh-token", "/auth/google", "/auth/google/callback"];
        return !authPaths.some(path => req.path.includes(path));
    }
});

router.route("/auth/google").get(
    authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.route(
  "/auth/google/callback"
).get(
    authLimiter,
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;
      if(!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/?authError=user_not_found`);
      }

      // Generate JWT token
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      }

      // Send token as cookies
      res.cookie("accessToken", accessToken, options);
      res.cookie("refreshToken", refreshToken, options);

      // Redirect with only role - keeps URL short, tokens already in cookies
      const isAdmin = user.role === "admin" ? "true" : "false";
      const callbackUrl = `${process.env.FRONTEND_URL}/?authSuccess=true&isAdmin=${isAdmin}`;
      res.redirect(callbackUrl);
    } catch (error) {
      console.error("Error in Google callback route:", error);
      res.redirect(`${process.env.FRONTEND_URL}/?authError=callback_error`);
    }
  }
);

// unsecured routes - apply authLimiter
router.route("/register").post(authLimiter, registerUser)
router.route("/create-admin").post(authLimiter, registerUser);

router.route("/login").post(authLimiter, loginUser)

router.route("/refresh-token").post(authLimiter, refreshAccessToken)

// secured routes
router.route("/logout").post(
    verifyJWT,
    logoutUser
)

router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
)

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

router.route("/update-account").patch(
    verifyJWT,
    updateAccountDetails
)

router.route("/delete-account").delete(
    verifyJWT,
    deleteUserAccount
)



export default router;