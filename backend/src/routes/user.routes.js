import { Router } from "express";
import passport from "passport";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, deleteUserAccount} from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/auth/google").get(
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.route(
  "/auth/google/callback"
).get(
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;
      if(!user) {
        return res.redirect("/login");
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

      // Send token as cookie
      res.cookie("accessToken", accessToken, options);
      res.cookie("refreshToken", refreshToken, options);

      // Redirect user to your frontend dashboard or page
      res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
      console.error("Error in Google callback route:", error);
      res.redirect("/login");
    }
  }
);

// unsecured routes
router.route("/register").post(registerUser)
router.route("/create-admin").post(registerUser);

router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)

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