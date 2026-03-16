import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPermissions() {
  console.log('🔍 Verifying Manager permissions...\n');

  // Get Manager role
  const managerRole = await prisma.role.findUnique({
    where: { name: 'manager' },
    include: {
      rolePermissions: {
        include: {
          module: true,
          permission: true,
        },
      },
    },
  });

  if (!managerRole) {
    console.log('❌ Manager role not found');
    process.exit(1);
  }

  console.log(`✅ Found Manager role: ${managerRole.displayName}\n`);

  // Get all modules
  const allModules = await prisma.module.findMany();
  const metaModule = allModules.find((m) => m.name === 'meta');

  if (!metaModule) {
    console.log('❌ Meta module not found');
    process.exit(1);
  }

  // Check if Manager has permission on Meta module
  const metaPermission = managerRole.rolePermissions.find(
    (rp) => rp.moduleId === metaModule.id
  );

  console.log('📊 Manager Modules:');
  console.log('═'.repeat(50));

  const moduleNames = new Set<string>();
  managerRole.rolePermissions.forEach((rp) => {
    moduleNames.add(rp.module.displayName);
  });

  Array.from(moduleNames)
    .sort()
    .forEach((name) => {
      console.log(`  ✓ ${name}`);
    });

  console.log('\n📋 Meta Module Status:');
  console.log('═'.repeat(50));

  if (metaPermission) {
    console.log('⚠️  Manager HAS permission on Meta module (UNEXPECTED)');
    console.log(`  Permissions: ${metaPermission.permission.displayName}`);
  } else {
    console.log('✅ Manager DOES NOT have permission on Meta module');
    console.log('   (Only Admin can manage Meta)');
  }

  console.log('\n📊 Permission Summary:');
  console.log('═'.repeat(50));

  // Count permissions by module
  const modulesWithPermission = new Set(
    managerRole.rolePermissions.map((rp) => rp.module.name)
  );

  console.log(`Total modules with permission: ${modulesWithPermission.size}`);
  console.log(`Meta module included: ${metaPermission ? 'YES ❌' : 'NO ✅'}`);

  if (!metaPermission) {
    console.log(
      '\n✨ Configuration is correct: Only Admin can manage Meta module'
    );
  }

  await prisma.$disconnect();
  process.exit(metaPermission ? 1 : 0);
}

verifyPermissions().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
