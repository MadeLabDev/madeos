/**
 * Email Service Test Script
 * Run with: node scripts/test-email.mjs
 */

import { render } from '@react-email/render';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

import { TestEmail } from '../lib/email/templates/test.tsx';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Email configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Test 1: Verify SMTP Configuration
  console.log('1️⃣ Verifying SMTP configuration...');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   Secure: ${process.env.EMAIL_SECURE}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log('');

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(error);
    process.exit(1);
  }

  // Test 2: Send Test Email with Full Template
  console.log('2️⃣ Sending test email with full header/footer...');
  try {
    // Render the test email template with full base layout
    const html = render(TestEmail({
      testMessage: 'This is a test email from MADE Laboratory with full header and footer.'
    }));

    const info = await transporter.sendMail({
      from: `"MADE Laboratory" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - MADE Laboratory',
      html: html,
    });

    console.log(`✅ Test email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox: ${process.env.EMAIL_USER}\n`);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
  }

  console.log('✨ Email service test completed!');
}

// Run tests
testEmailService().catch(console.error);
