import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const allPermission = await prisma.permissions.upsert({
    where: { name: 'all_permissions' },
    update: {},
    create: {
      name: 'all_permissions',
      description: 'You can access anything with this permission',
    },
  });

  const administrator = await prisma.roles.upsert({
    where: { name: 'administrator' },
    update: {},
    create: {
      name: 'administrator',
      permissions: {
        create: [{ permission: { connect: { name: allPermission.name } } }],
      },
    },
  });
  console.log(`give permission ${allPermission.name} -> ${administrator.name}`);

  const isAuthenticated = await prisma.permissions.upsert({
    where: { name: 'is_authenticated' },
    update: {},
    create: {
      name: 'is_authenticated',
      description: 'You are authenticated.',
    },
  });

  const user = await prisma.roles.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      permissions: {
        create: [{ permission: { connect: { name: isAuthenticated.name } } }],
      },
    },
  });
  console.log(`give permission ${isAuthenticated.name} -> ${user.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
