// ShopCore API | services/emailService.js
// Role: sends emails with Nodemailer. With no SMTP_HOST set (local dev), it prints the email in the terminal.
// Owner: Ogunsola Israel Oluwajomiloju (OG3)
import nodemailer from 'nodemailer';

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`\n[email not sent: SMTP not configured]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  await getTransporter().sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
};
