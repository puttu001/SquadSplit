import { PrismaClient, SplitType, ExpenseCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice Sharma',
      passwordHash,
      isEmailVerified: true,
      upiId: 'alice@upi',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob Verma',
      passwordHash,
      isEmailVerified: true,
      upiId: 'bob@upi',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      name: 'Charlie Patel',
      passwordHash,
      isEmailVerified: true,
    },
  });

  // Create a group
  const group = await prisma.group.create({
    data: {
      name: 'Goa Trip 2025',
      description: 'Friends trip to Goa',
      members: {
        create: [
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id },
          { userId: charlie.id },
        ],
      },
    },
  });

  // Add a sample expense
  await prisma.expense.create({
    data: {
      groupId: group.id,
      paidById: alice.id,
      amount: 3000,
      description: 'Hotel booking for two nights in North Goa',
      category: ExpenseCategory.TRAVEL,
      date: new Date(),
      splits: {
        create: [
          { userId: alice.id,   amount: 1000, splitType: SplitType.EQUAL },
          { userId: bob.id,     amount: 1000, splitType: SplitType.EQUAL },
          { userId: charlie.id, amount: 1000, splitType: SplitType.EQUAL },
        ],
      },
    },
  });

  console.log('Seed complete.');
  console.log('Demo credentials: alice@example.com / Password123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
