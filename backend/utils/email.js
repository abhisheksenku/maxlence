const nodemailer = require('nodemailer');
require('dotenv').config();
// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Common email wrapper
const getEmailTemplate = (title, content) => {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:10px;">
      <div style="background:#6366f1;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">AuthApp</h1>
      </div>
      <div style="background:#fff;padding:30px;border-radius:0 0 8px 8px;">
        ${content}
        <p style="color:#9ca3af;font-size:13px;margin-top:20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
};

// Send verification email
const sendVerificationEmail = async (email, firstName, token) => {
  const transporter = createTransporter();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const htmlContent = `
    <h2 style="color:#1f2937;">Hello, ${firstName} 👋</h2>
    <p style="color:#6b7280;line-height:1.6;">
      Thanks for registering! Please verify your email address to get started.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${verifyUrl}" 
         style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;
                text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
        Verify Email
      </a>
    </div>
    <p style="color:#9ca3af;font-size:13px;">
      This link expires in 24 hours.
    </p>
  `;

  await transporter.sendMail({
    from: `"AuthApp" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: getEmailTemplate('Verify Email', htmlContent),
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, token) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <h2 style="color:#1f2937;">Password Reset, ${firstName}</h2>
    <p style="color:#6b7280;line-height:1.6;">
      We received a request to reset your password. Click the button below to set a new one.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${resetUrl}" 
         style="background:#ef4444;color:#fff;padding:14px 32px;border-radius:8px;
                text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#9ca3af;font-size:13px;">
      This link expires in 1 hour.
    </p>
  `;

  await transporter.sendMail({
    from: `"AuthApp" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request',
    html: getEmailTemplate('Reset Password', htmlContent),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};