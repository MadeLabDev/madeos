/**
 * Create test user for forgot password testing
 * Run with: node scripts/create-test-user.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('👤 Creating test user...\n');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create or update test user
    const user = await prisma.user.upsert({
      where: { email: 'test@madelab.io' },
      update: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
      create: {
        email: 'test@madelab.io',
        username: 'testuser',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    console.log('✅ Test user created/updated:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Password: password123`);
    console.log('');
    console.log('You can now test forgot password flow at:');
    console.log(`   http://localhost:3000/auth/forgot-password`);

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
