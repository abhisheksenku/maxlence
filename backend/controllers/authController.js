const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { generateTokens, verifyRefreshToken } = require("../utils/jwt");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");
const { deleteCache, deleteCachePattern } = require("../config/redis");
const { Op, where } = require("sequelize");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !email || !password) {
      return res
        .status(400)
        .json({ message: "First name, email and password are required" });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const profileImage = req.file ? req.file.path : null;
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
      profileImage,
    });
    await sendVerificationEmail(newUser.email, newUser.firstName, verificationToken);
    res
      .status(201)
      .json({
        message:
          `User ${newUser.firstName} registered successfully. Please check your email to verify your account.`,
      });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await deleteCachePattern('users:page:*');
  }
};
const login = async (req, res) => {
  // Implementation for login
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.password) {
      return res
        .status(400)
        .json({message: "Password not set for this account"});
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in" });
    }
    if (!user.isActive) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in" });
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    user.refreshToken = refreshToken;
    await user.save();
    //Invalidate cache for this user
    await deleteCache(`user:${user.id}`);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  } 
};
const verifyEmail = async (req, res) => {
  // Implementation for email verification
  try {
    const { token } = req.query;
    if(!token){
      return res.status(400).json({message: "Verification token is required"});
    }
    const user = await User.findOne({where: {
      verificationToken: token,
      verificationTokenExpiry: {
        [Op.gt]: new Date(),
      },
    }});
    if (!user) {
      return res.status(400).json({message: "Invalid or expired verification token"});
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    res.status(200).json({message: "Email verified successfully"});
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({message: "Internal server error"});
  }

};
const refreshToken = async (req, res) => {
  // Implementation for token refresh
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({ where: { id: decoded.id, refreshToken } });
    if (!user) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);
    user.refreshToken = newRefreshToken;
    await user.save();
    await deleteCache(`user:${user.id}`); // Invalidate cache for this user
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const logout = async (req, res) => {
  // Implementation for logout
  try {
    const {refreshToken: token} = req.body;
    if(!token){
      return res.status(400).json({message: "Refresh token is required"});
    }
    const user = await User.findOne({where: {refreshToken: token}});
    if(!user){
      return res.status(400).json({message: "Invalid refresh token"});
    }
    user.refreshToken = null;
    await user.save();
    await deleteCache(`user:${user.id}`);
    res.status(200).json({message: "Logged out successfully"});

  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user.email, user.firstName, resetToken);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findOne({ where: {
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { [Op.gt]: new Date() },
    }});
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    user.refreshToken = null; // Invalidate existing refresh tokens
    await user.save();
    await deleteCache(`user:${user.id}`); // Invalidate cache for this user
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id,{
        attributes: {exclude: ["password", "refreshToken", "verificationToken", "verificationTokenExpiry", "resetPasswordToken", "resetPasswordTokenExpiry"]},
    });
    if(!user){
      return res.status(404).json({message: "User not found"});
    };
    res.status(200).json({ message: "User found", data: user });
  } catch (error) {
    console.error("Error in get me:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user from the protect middleware (req.user.id)
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password (your Model hook will handle hashing)
    user.password = password;
    await user.save();
    await deleteCache(`user:${user.id}`);
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword
};
