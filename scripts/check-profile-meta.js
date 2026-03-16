const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
const prisma = new PrismaClient();

(async () => {
  const profileMeta = await prisma.moduleType.findUnique({
    where: { key: 'profile' }
  });
  
  console.log('\n=== Profile Meta ===');
  console.log('Key:', profileMeta?.key);
  console.log('System:', profileMeta?.system);
  console.log('FieldSchema type:', typeof profileMeta?.fieldSchema);
  console.log('FieldSchema keys:', Object.keys(profileMeta?.fieldSchema || {}));
  console.log('Has fields:', 'fields' in (profileMeta?.fieldSchema || {}));
  console.log('\nFieldSchema:', JSON.stringify(profileMeta?.fieldSchema, null, 2));
  
  await prisma.$disconnect();
})();
