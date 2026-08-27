const express = require("express");
const passport = require("passport");
const { signup, login, verifyOtp, googleCallback, forgotPassword, resetPassword, getProfile, otpLoginRequest, otpLoginVerify } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/signup", signup); // Disabled public signup as per hierarchy management requirements
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/otp-login-request", otpLoginRequest);
router.post("/otp-login-verify", otpLoginVerify);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getProfile);

// ================= GOOGLE OAUTH =================
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login?error=oauth_failed" }),
    googleCallback
);

module.exports = router;