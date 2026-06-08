const nodemailer = require("nodemailer");
require("dotenv").config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = {
  sendPasswordResetEmail: async (to, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Reset your Yaclam password",
      html: `
        <p>You requested a password reset for your Yaclam account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
      `,
      text: `Reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    });
  },
};
