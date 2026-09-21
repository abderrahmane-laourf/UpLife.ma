import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.MAILTRAP_PORT || 2525),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendOtpEmail({ to, code, expiresAt }) {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'noreply@uplife.ma',
    to,
    subject: 'Your UpLife password reset code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
        <h2 style="margin: 0 0 16px; color: #0f172a;">Reset your password</h2>
        <p style="color: #334155; font-size: 16px;">Use the code below to reset your password:</p>
        <div style="margin: 24px 0; padding: 18px; border-radius: 12px; background: #eff6ff; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1d4ed8;">${code}</div>
        <p style="color: #475569; font-size: 14px;">This code expires at <strong>${new Date(expiresAt).toLocaleString()}</strong>.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
