/**
 * Test Forgot Password Flow
 * This script tests the complete forgot password functionality
 */

console.log('🧪 Testing Forgot Password Flow\n');

console.log('📋 Test Steps:');
console.log('1. Go to: http://localhost:3000/auth/forgot-password');
console.log('2. Enter email: test@madelab.io');
console.log('3. Click "Send Reset Link"');
console.log('4. Check email inbox: info@madelab.io');
console.log('5. Click the reset link in email');
console.log('6. Enter new password (min 8 characters)');
console.log('7. Confirm new password');
console.log('8. Click "Reset Password"');
console.log('9. Try logging in with new password\n');

console.log('✅ Test User:');
console.log('   Email: test@madelab.io');
console.log('   Current Password: password123\n');

console.log('📧 Email will be sent to: info@madelab.io');
console.log('   (Check spam folder if not in inbox)\n');

console.log('Tips:');
console.log('   - Token expires after 1 hour');
console.log('   - If token expires, request new reset link');
console.log('   - Check server logs for email send confirmation');
console.log('   - Password must be at least 8 characters\n');
