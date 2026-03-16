#!/usr/bin/env node

/**
 * Generate ENCRYPTION_KEY for Two-Factor Authentication
 * Run: node scripts/generate-2fa-key.mjs
 */

import crypto from 'crypto';

console.log('\n🔐 Generating encryption key for 2FA...\n');

const key = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated 64-character hex encryption key:\n');
console.log(`ENCRYPTION_KEY="${key}"`);
console.log('\n📋 Add this to your .env.local file\n');
console.log('⚠️  Keep this key secret and never commit it to version control!\n');
