/**
 * Email Service Test Script
 * Run with: npx ts-node scripts/test-email.ts
 */

import { emailService, verifyEmailConfig } from '@/lib/email/service';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Verify SMTP Configuration
  console.log('1️⃣ Verifying SMTP configuration...');
  try {
    await verifyEmailConfig();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    process.exit(1);
  }

  // Test 2: Send Password Reset Email
  console.log('2️⃣ Testing password reset email...');
  try {
    const testEmail = 'test@example.com'; // Change to your email for testing
    const resetToken = 'test-token-123456';
    
    await emailService.sendResetPasswordEmail(testEmail, 'Test User', resetToken);
    console.log(`✅ Password reset email sent to ${testEmail}\n`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
  }

  // Test 3: Send Welcome Email
  console.log('3️⃣ Testing welcome email...');
  try {
    const testEmail = 'test@example.com'; // Change to your email for testing
    
    await emailService.sendWelcomeEmail(testEmail, 'Test User');
    console.log(`✅ Welcome email sent to ${testEmail}\n`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }

  console.log('✨ Email service test completed!');
}

// Run tests
testEmailService().catch(console.error);
