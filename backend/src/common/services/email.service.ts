import nodemailer from "nodemailer";

// Gmail SMTP via an App Password (not the account's normal login password
// -- generated separately at myaccount.google.com/apppasswords, since
// Gmail blocks direct password auth for third-party apps).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const emailService = {
  async sendVerificationCode(to: string, code: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const subject = purpose === "REGISTRATION" ? "Verify your NyayaOne account" : "Reset your NyayaOne password";
    const heading = purpose === "REGISTRATION" ? "Verify Your Email" : "Password Reset Code";

    await transporter.sendMail({
      from: `"NyayaOne" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563EB;">${heading}</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</p>
          <p style="color: #6B7280; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  },
};
