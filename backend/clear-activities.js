import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllActivities() {
  try {
    console.log('🗑️  Starting to clear all activities data...\n');

    // Delete all missed activities
    const deletedMissed = await prisma.missedActivity.deleteMany({});
    console.log(`✅ Deleted ${deletedMissed.count} missed activities`);

    // Delete all activities
    const deletedActivities = await prisma.activity.deleteMany({});
    console.log(`✅ Deleted ${deletedActivities.count} activities`);

    // Delete all daily reviews (if you have them)
    const deletedReviews = await prisma.dailyReview.deleteMany({});
    console.log(`✅ Deleted ${deletedReviews.count} daily reviews`);

    // Delete all notes
    const deletedNotes = await prisma.note.deleteMany({});
    console.log(`✅ Deleted ${deletedNotes.count} notes`);

    console.log('\n🎉 All activity data cleared successfully!');
    console.log('📌 Users and Categories were NOT deleted (preserved)');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllActivities();
