const nodemailer = require('nodemailer');

let transporter;

const initTransporter = async () => {
  if (transporter) return transporter;

  // Use real credentials if provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // or another provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('Real Email Transporter configured.');
  } else {
    // Fallback: Create ethereal email account for testing, or just use log
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Mock Email Transporter active (Ethereal). User: ${testAccount.user}`);
    } catch (err) {
      console.log('Fallback: SMTP connection failed, using console logger for emails.');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n--- MOCK EMAIL SENT ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
          console.log('-----------------------\n');
          return { messageId: 'mock-id-' + Date.now() };
        },
      };
    }
  }
  return transporter;
};

// Generic mail sender
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const activeTransporter = await initTransporter();
    const mailOptions = {
      from: `"CMS Support" <${process.env.EMAIL_USER || 'no-reply@complaintmanager.com'}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await activeTransporter.sendMail(mailOptions);
    // Log ethereal preview URL if applicable
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal Email Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failure:', error.message);
    return { success: false, error: error.message };
  }
};

// Verification email template
const sendVerificationEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyLink = `${clientUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1; text-align: center;">Welcome to Complaint Management System!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering on our platform. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
      <p>If you did not request this registration, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">CMS Inc. Support Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject: 'CMS - Verify Your Email Address',
    html,
    text: `Hi ${name}, please verify your email using this link: ${verifyLink}`,
  });
};

// Password Reset Email
const sendResetPasswordEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ef4444; text-align: center;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You are receiving this email because a password reset request was made for your account.</p>
      <p>Please click the button below to set a new password. This link is valid for 1 hour:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not make this request, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">CMS Inc. Security Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'CMS - Password Reset Request',
    html,
    text: `Hi ${name}, reset your password using this link: ${resetLink}`,
  });
};

// Complaint Status Update Notification
const sendComplaintStatusEmail = async (email, name, complaintTitle, status, messageDetail = '') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3b82f6; text-align: center;">Complaint Status Update</h2>
      <p>Hi ${name},</p>
      <p>The status of your complaint <strong>"${complaintTitle}"</strong> has been updated to:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="background-color: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 18px;">${status}</span>
      </div>
      ${messageDetail ? `<p><strong>Details:</strong> ${messageDetail}</p>` : ''}
      <p>You can check the progress and communicate with your assigned agent by logging in to the Dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">CMS Inc. Helpdesk</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `CMS - Update on Complaint: ${complaintTitle}`,
    html,
    text: `Hi ${name}, your complaint "${complaintTitle}" is now: ${status}. ${messageDetail}`,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendComplaintStatusEmail,
};
