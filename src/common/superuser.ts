/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  try {
    console.log('===== CREATE SUPERUSER =====');

    const name = await askQuestion('Input your name: ');
    const email = await askQuestion('Input your email: ');
    const password = await askQuestion('Input your password: ');

    if (!name || !email || !password) {
      console.log('Name, email, and password cannot be empty');
      process.exit(1);
    }

    const checkEmail = await prisma.users.count({ where: { email: email } });
    if (checkEmail > 0) {
      console.log('Email already use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: {
          connect: { name: 'administrator' },
        },
      },
    });
    console.log(`Superuser with name ${admin.name} has been created`);

    rl.close();
  } catch (error) {
    console.error('Error creating superuser: ', error);
    rl.close();
  } finally {
    await prisma.$disconnect();
  }
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
