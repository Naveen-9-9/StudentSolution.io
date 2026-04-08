const nodemailer = require('nodemailer');

// For development, we'll use Ethereal (test account) 
// In production, these should be from process.env
let transporter;

const setupTransporter = async () => {
  if (transporter) return transporter;

  // Real credentials from ENV if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return transporter;
  }

  // Development: Ethereal fallback
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Email Service] Ethereal test account created: ${testAccount.user}`);
  } catch (err) {
    console.error(`[Email Service] Failed to create test account:`, err.message);
  }

  return transporter;
};

const sendVerificationEmail = async (user, token) => {
  const t = await setupTransporter();
  if (!t) return;

  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

  const mailOptions = {
    from: '"StudentSolution.ai" <verify@studentsolution.ai>',
    to: user.email,
    subject: "🔐 Secure Your Identity - StudentSolution.ai",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #060612; color: #ffffff; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; padding: 40px; text-align: center; }
          .logo { font-weight: 900; font-size: 24px; letter-spacing: -1px; margin-bottom: 30px; }
          .accent { color: #6d28d9; }
          .btn { display: inline-block; padding: 20px 40px; background: #6d28d9; color: #ffffff; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 20px 40px rgba(109, 40, 217, 0.3); margin-top: 30px; }
          .footer { margin-top: 40px; color: rgba(255, 255, 255, 0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">STUDENTSOLUTION<span class="accent">.AI</span></div>
          <h1>Activate Portal Access</h1>
          <p>Hello ${user.name}, you&apos;re one step away from joining the community. Please establish your identity by clicking the button below.</p>
          <a href="${verificationUrl}" class="btn">Deploy Identity</a>
          <p style="margin-top: 40px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">This link will expire in 24 hours.</p>
          <div class="footer">Built for Students, by Students</div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await t.sendMail(mailOptions);
    console.log(`[Email Service] Message sent: %s`, info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Service] Preview URL: ${previewUrl}`);
      
      // Also save to a local file for easy retrieval by the UI or agent
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../../verification_links.log');
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] User: ${user.email} | Link: ${previewUrl}\n`);
    }
    return info;
  } catch (error) {
    console.error(`[Email Service] Error sending email:`, error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
