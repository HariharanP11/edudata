import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER || "";
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "";
const fromEmail = process.env.OTP_FROM_EMAIL || gmailUser;

let transporter: nodemailer.Transporter | null = null;

if (gmailUser && gmailAppPassword) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
} else {
  console.warn(
    "[OTP-Email] GMAIL_USER/GMAIL_APP_PASSWORD not configured. OTP emails will not be sent."
  );
}

/**
 * Send OTP code via Gmail.
 * Returns true on success, false on failure or when mailer not configured.
 */
export async function sendEmailOtp(
  to: string,
  code: string,
  expiryMinutes: number
): Promise<boolean> {
  if (!transporter || !fromEmail) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Your EduData OTP Code",
      text: `Your EduData OTP is: ${code}. It expires in ${expiryMinutes} minutes.`,
    });
    return true;
  } catch (err) {
    console.warn("[OTP-Email] send failed:", err);
    return false;
  }
}
