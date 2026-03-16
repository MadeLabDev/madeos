import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Checking Modules ===");
  const modules = await prisma.module.findMany();
  console.log("Modules:", modules.map(m => m.name));

  console.log("\n=== Checking Admin Role Permissions ===");
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
    include: {
      rolePermissions: {
        include: {
          module: true,
          permission: true,
        },
      },
    },
  });

  if (adminRole) {
    const modulesByName = new Map();
    adminRole.rolePermissions.forEach(rp => {
      if (!modulesByName.has(rp.module.name)) {
        modulesByName.set(rp.module.name, []);
      }
      modulesByName.get(rp.module.name).push(rp.permission.action);
    });

    console.log("Admin has permissions for:");
    modulesByName.forEach((actions, module) => {
      console.log(`  - ${module}: ${actions.join(', ')}`);
    });
  }

  console.log("\n=== Checking Admin User Session ===");
  const adminUser = await prisma.user.findUnique({
    where: { email: 'baonguyenyam@gmail.com' },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  module: true,
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (adminUser) {
    console.log("Admin user roles:", adminUser.userRoles.map(ur => ur.role.name));
    
    const permissionsMap = new Map();
    adminUser.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        if (!permissionsMap.has(rp.module.name)) {
          permissionsMap.set(rp.module.name, []);
        }
        permissionsMap.get(rp.module.name).push(rp.permission.action);
      });
    });

    console.log("Admin user merged permissions:");
    permissionsMap.forEach((actions, module) => {
      console.log(`  - ${module}: ${actions.join(', ')}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
