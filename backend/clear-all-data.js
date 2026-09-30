import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🗑️  Starting to clear ALL data from database...\n');
    console.log('⚠️  WARNING: This will delete EVERYTHING!\n');

    // Delete all missed activities
    const deletedMissed = await prisma.missedActivity.deleteMany({});
    console.log(`✅ Deleted ${deletedMissed.count} missed activities`);

    // Delete all activities
    const deletedActivities = await prisma.activity.deleteMany({});
    console.log(`✅ Deleted ${deletedActivities.count} activities`);

    // Delete all daily reviews
    const deletedReviews = await prisma.dailyReview.deleteMany({});
    console.log(`✅ Deleted ${deletedReviews.count} daily reviews`);

    // Delete all notes
    const deletedNotes = await prisma.note.deleteMany({});
    console.log(`✅ Deleted ${deletedNotes.count} notes`);

    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    // Delete all categories
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`✅ Deleted ${deletedCategories.count} categories`);

    console.log('\n🎉 ALL DATA CLEARED SUCCESSFULLY!');
    console.log('📌 Database is now completely empty');
    console.log('💡 Run "node prisma/seed-categories.js" to restore default categories');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllData();
