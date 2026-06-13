import nodemailer from 'nodemailer';
import { env } from '../../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: MailOptions) {
  return transporter.sendMail({ from: env.EMAIL_FROM, ...options });
}

export function buildVerifyEmailHtml(name: string, otp: string) {
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px">
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Verify your email</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px">Hi ${name}, use the code below to activate your SquadSplit account.</p>
    <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e5e7eb">
      <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;letter-spacing:.05em;text-transform:uppercase">Your verification code</p>
      <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:12px;color:#0d9488">${otp}</p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;text-align:center">This code expires in 15 minutes. Do not share it with anyone.</p>
  </div>`;
}

export function buildResetPasswordHtml(name: string, link: string) {
  return `<p>Hi ${name},</p>
  <p>Click the link below to reset your password:</p>
  <a href="${link}">${link}</a>
  <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`;
}

export function buildSettlementReminderHtml(
  payerName: string,
  payeeName: string,
  amount: number,
  upiLink: string,
) {
  return `<p>Hi ${payerName},</p>
  <p>You owe <strong>₹${amount}</strong> to <strong>${payeeName}</strong>.</p>
  <p>Pay now via UPI: <a href="${upiLink}">${upiLink}</a></p>`;
}
