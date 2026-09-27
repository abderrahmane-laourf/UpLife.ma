const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
    { id: '1', label: 'Fitness',   color: '#22C55E' },
    { id: '2', label: 'Health',    color: '#3B82F6' },
    { id: '3', label: 'Wellness',  color: '#A855F7' },
    { id: '4', label: 'Nutrition', color: '#F59E0B' },
    { id: '5', label: 'Growth',    color: '#EC4899' },
]

async function seedCategories() {
    for (const category of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
            where: { id: category.id },
            update: {},
            create: category,
        });
    }
}

seedCategories();