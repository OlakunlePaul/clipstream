import { resend } from './resend';
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Unified email sender function.
 * Automatically uses Resend if configured, otherwise falls back to Gmail SMTP via Nodemailer.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder';

  if (hasResend) {
    try {
      console.log(`Sending email to ${to} via Resend...`);
      const { data, error } = await resend.emails.send({
        from: 'hello@clipstream.dev',
        to,
        subject,
        text,
        html: html || text,
      });

      if (error) {
        throw error;
      }
      return { success: true, provider: 'resend', data };
    } catch (resendError) {
      console.error('Failed to send email via Resend, attempting SMTP fallback...', resendError);
    }
  }

  // Fallback to SMTP (Gmail)
  const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtp) {
    try {
      console.log(`Sending email to ${to} via SMTP fallback...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE !== 'false', // Default to true (SSL) for port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"ClipStream" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || text,
      });

      console.log('SMTP Email sent successfully:', info.messageId);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpError) {
      console.error('Failed to send email via SMTP fallback:', smtpError);
      throw smtpError;
    }
  }

  console.warn(`No email provider configured. Skipped sending email to ${to}.`);
  return { success: false, provider: 'none' };
}
