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
        const authPaths = ["/login", "/register", "/create-admin", "/refresh-token", "/auth/google", "/auth/google-url", "/auth/google/callback"];
        return !authPaths.some(path => req.path.includes(path));
    }
});

router.route("/auth/google").get(
    authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// New endpoint: Get Google OAuth URL for frontend to use
router.route("/auth/google-url").get((req, res) => {
  try {
    // Generate the Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'online',
      prompt: 'consent'
    }).toString()}`;
    
    res.json({ authUrl: googleAuthUrl });
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    res.status(500).json({ message: "Could not generate Google OAuth URL" });
  }
});

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

      // Also send tokens in URL for frontend to use (frontend will store in localStorage)
      // Encode user data safely
      const userData = btoa(JSON.stringify(user));
      
      const callbackUrl = `${process.env.FRONTEND_URL}/?authSuccess=true&role=${user.role}&token=${accessToken}&user=${encodeURIComponent(userData)}`;
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