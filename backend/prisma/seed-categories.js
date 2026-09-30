import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
    { name: 'Fitness',   description: 'Physical activities and workouts', color: '#22C55E' },
    { name: 'Health',    description: 'Health checkups and medical care', color: '#3B82F6' },
    { name: 'Wellness',  description: 'Mental and emotional wellbeing', color: '#A855F7' },
    { name: 'Nutrition', description: 'Healthy eating and meal planning', color: '#F59E0B' },
    { name: 'Growth',    description: 'Personal development and learning', color: '#EC4899' },
    { name: 'Prayer',    description: 'Spiritual activities and prayer', color: '#8B5CF6' },
    { name: 'Work',      description: 'Professional and career activities', color: '#06B6D4' },
    { name: 'Social',    description: 'Social connections and relationships', color: '#F59E0B' },
];

async function seedCategories() {
    try {
        console.log('🌱 Starting category seeding...\n');

        for (const category of DEFAULT_CATEGORIES) {
            const result = await prisma.category.upsert({
                where: { name: category.name },
                update: {
                    description: category.description,
                    color: category.color,
                },
                create: {
                    name: category.name,
                    description: category.description,
                    color: category.color,
                },
            });
            console.log(`✅ ${result.name} - ${result.color}`);
        }

        console.log(`\n🎉 Successfully seeded ${DEFAULT_CATEGORIES.length} categories!`);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedCategories();