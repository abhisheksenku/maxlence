const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const {authenticate} = require("../middleware/auth");
const {upload, handleUploadError} = require("../middleware/upload");
const {validate, registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation} = require("../middleware/validate");

// Registration route
router.post("/register", upload.single("profileImage"), handleUploadError, registerValidation, validate, authController.register);

// Login route
router.post("/login", loginValidation, validate, authController.login);
//Email verification route
router.get("/verify-email", authController.verifyEmail);
//Refresh token route
router.post("/refresh-token", authController.refreshToken);
//Logout route
router.post("/logout", authController.logout);
//Forgot password route
router.post("/forgot-password", forgotPasswordValidation, validate, authController.forgotPassword);
//Reset password route
router.post("/reset-password", resetPasswordValidation, validate, authController.resetPassword);
// Add to authRoutes.js
router.put('/update-password',authenticate, authController.updatePassword);
//Get current user profile
router.get("/me",authenticate, authController.getMe);

module.exports = router;