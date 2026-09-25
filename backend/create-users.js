import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🚀 Creating admin and user accounts...\n');

    // Hash password: Admin@123
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Create Admin User
    const admin = await prisma.user.upsert({
      where: { phone: '212600000001' },
      update: { role: 'ADMIN' },
      create: {
        name: 'Admin UpLife',
        phone: '212600000001',
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Phone: +${admin.phone}`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: ${admin.role}\n`);

    // Create Regular User
    const user = await prisma.user.upsert({
      where: { phone: '212600000002' },
      update: { role: 'USER' },
      create: {
        name: 'User UpLife',
        phone: '212600000002',
        passwordHash,
        role: 'USER',
      },
    });

    console.log('✅ Regular user created:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Phone: +${user.phone}`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: ${user.role}\n`);

    console.log('🎉 All users created successfully!\n');
    console.log('📝 Login Credentials:\n');
    console.log('Admin Account:');
    console.log('  Phone: +212600000001');
    console.log('  Password: Admin@123\n');
    console.log('User Account:');
    console.log('  Phone: +212600000002');
    console.log('  Password: Admin@123\n');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
