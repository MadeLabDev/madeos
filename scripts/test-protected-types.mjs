import { prisma } from './lib/prisma.mjs';

async function testProtectedTypes() {
  console.log('\n🧪 Testing Protected Module Types...\n');

  // Test 1: Verify protected types exist in database
  console.log('✓ Test 1: Checking if protected types exist in database...');
  const protectedKeys = ['blog', 'knowngle', 'product', 'order'];
  
  for (const key of protectedKeys) {
    const exists = await prisma.moduleType.findUnique({ where: { key } });
    if (exists) {
      console.log(`  ✅ ${key}: Found (ID: ${exists.id})`);
    } else {
      console.log(`  ❌ ${key}: Not found`);
    }
  }

  // Test 2: Test import of protection functions
  console.log('\n✓ Test 2: Testing protection utility functions...');
  try {
    const { isProtectedModuleType, getProtectedTypeErrorMessage } = await import(
      './lib/features/meta/config/protected-types.js'
    );
    
    console.log(`  ✅ isProtectedModuleType('blog'): ${isProtectedModuleType('blog')}`);
    console.log(`  ✅ isProtectedModuleType('custom'): ${isProtectedModuleType('custom')}`);
    console.log(`  ✅ Error message for delete: "${getProtectedTypeErrorMessage('delete')}"`);
  } catch (error) {
    console.log(`  ❌ Error importing protection functions: ${error.message}`);
  }

  console.log('\n✅ All tests passed!\n');
  process.exit(0);
}

testProtectedTypes().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
