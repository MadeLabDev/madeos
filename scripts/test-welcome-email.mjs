#!/usr/bin/env node

/**
 * Test script to send a welcome email
 * Usage: node scripts/test-welcome-email.mjs <email> [name]
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const testEmail = process.argv[2] || 'baonguyenyam@gmail.com';
const testName = process.argv[3] || 'Test User';

console.log('🧪 Testing Welcome Email...\n');
console.log('Configuration:');
console.log('- Host:', process.env.EMAIL_HOST);
console.log('- Port:', process.env.EMAIL_PORT);
console.log('- User:', process.env.EMAIL_USER);
console.log('- To:', testEmail);
console.log('- Name:', testName);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Simple HTML welcome email
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Welcome to MADE Laboratory!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${testName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Your account has been successfully created. We're excited to have you on board!
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                MADE Laboratory helps you manage your business operations efficiently.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="margin: 0 0 30px;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
                       style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you have any questions, our support team is here to help at 
                <a href="mailto:support@madelab.io" style="color: #667eea; text-decoration: none;">support@madelab.io</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #6c757d;">
                © 2025 MADE Laboratory. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #6c757d;">
                📧 info@madelab.io | 📞 Support Line | 🌐 www.madelab.io
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function sendTestEmail() {
  try {
    console.log('📤 Sending email...\n');
    
    const info = await transporter.sendMail({
      from: `"MADE Laboratory" <${process.env.EMAIL_FROM}>`,
      to: testEmail,
      subject: 'Welcome to MADE Laboratory',
      html: htmlContent,
      text: `Hi ${testName},\n\nYour account has been successfully created. We're excited to have you on board!\n\nGet started: ${process.env.NEXTAUTH_URL}/auth/signin`,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n📬 Check your inbox at:', testEmail);
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error(error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

// Verify connection first
console.log('🔌 Verifying SMTP connection...\n');
transporter.verify()
  .then(() => {
    console.log('✅ SMTP server is ready\n');
    return sendTestEmail();
  })
  .catch(error => {
    console.error('❌ SMTP connection failed:');
    console.error(error.message);
    process.exit(1);
  });
