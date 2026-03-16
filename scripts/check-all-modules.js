const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
const prisma = new PrismaClient();

(async () => {
  const modules = await prisma.moduleType.findMany();
  
  console.log('\n=== All Module Types ===');
  modules.forEach(m => {
    console.log(`- key: ${m.key}, system: ${m.system}, name: ${m.name}`);
  });
  
  console.log(`\nTotal: ${modules.length}`);
  await prisma.$disconnect();
})();
