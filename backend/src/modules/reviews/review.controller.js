import prisma from '../../lib/prisma.js';

/**
 * Get all daily reviews for the authenticated user
 * GET /api/reviews
 */
export async function getAllReviews(req, res) {
  try {
    const userId = req.user.id;

    const reviews = await prisma.dailyReview.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.json({
      message: 'Reviews retrieved successfully',
      reviews: reviews.map(review => ({
        id: review.id,
        date: review.date,
        mood: review.mood,
        learned: review.learned,
        tomorrow: review.tomorrow,
        highlight: review.highlight,
        challenge: review.challenge,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve reviews',
      error: error.message,
    });
  }
}

/**
 * Get review by date
 * GET /api/reviews/date/:date
 */
export async function getReviewByDate(req, res) {
  try {
    const userId = req.user.id;
    const { date } = req.params; // Format: YYYY-MM-DD

    const review = await prisma.dailyReview.findFirst({
      where: {
        userId,
        date: new Date(date),
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found for this date' });
    }

    return res.json({
      message: 'Review retrieved successfully',
      review: {
        id: review.id,
        date: review.date,
        mood: review.mood,
        learned: review.learned,
        tomorrow: review.tomorrow,
        highlight: review.highlight,
        challenge: review.challenge,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get review by date error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve review',
      error: error.message,
    });
  }
}

/**
 * Get today's review
 * GET /api/reviews/today
 */
export async function getTodayReview(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const review = await prisma.dailyReview.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'No review for today yet' });
    }

    return res.json({
      message: 'Today\'s review retrieved successfully',
      review: {
        id: review.id,
        date: review.date,
        mood: review.mood,
        learned: review.learned,
        tomorrow: review.tomorrow,
        highlight: review.highlight,
        challenge: review.challenge,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get today review error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve today\'s review',
      error: error.message,
    });
  }
}

/**
 * Create a daily review
 * POST /api/reviews
 */
export async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { date, mood, learned, tomorrow, highlight, challenge } = req.body;

    // Validation
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ message: 'Mood is required and must be between 1 and 5' });
    }

    if (!learned || !learned.trim()) {
      return res.status(400).json({ message: 'Learned field is required' });
    }

    if (!tomorrow || !tomorrow.trim()) {
      return res.status(400).json({ message: 'Tomorrow\'s goal is required' });
    }

    // Parse date or use today
    const reviewDate = date ? new Date(date) : new Date();
    reviewDate.setHours(0, 0, 0, 0);

    // Check if review already exists for this date
    const existingReview = await prisma.dailyReview.findFirst({
      where: {
        userId,
        date: reviewDate,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'A review already exists for this date. Use PUT to update it.',
      });
    }

    const review = await prisma.dailyReview.create({
      data: {
        userId,
        date: reviewDate,
        mood: parseInt(mood),
        learned: learned.trim(),
        tomorrow: tomorrow.trim(),
        highlight: highlight?.trim() || null,
        challenge: challenge?.trim() || null,
      },
    });

    return res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        date: review.date,
        mood: review.mood,
        learned: review.learned,
        tomorrow: review.tomorrow,
        highlight: review.highlight,
        challenge: review.challenge,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      message: 'Failed to create review',
      error: error.message,
    });
  }
}

/**
 * Update review
 * PUT /api/reviews/:id
 */
export async function updateReview(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { mood, learned, tomorrow, highlight, challenge } = req.body;

    // Check if review exists and belongs to user
    const existingReview = await prisma.dailyReview.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Validate mood if provided
    if (mood !== undefined && (mood < 1 || mood > 5)) {
      return res.status(400).json({ message: 'Mood must be between 1 and 5' });
    }

    // Build update data
    const updateData = {};
    if (mood !== undefined) updateData.mood = parseInt(mood);
    if (learned !== undefined) {
      if (!learned.trim()) {
        return res.status(400).json({ message: 'Learned field cannot be empty' });
      }
      updateData.learned = learned.trim();
    }
    if (tomorrow !== undefined) {
      if (!tomorrow.trim()) {
        return res.status(400).json({ message: 'Tomorrow\'s goal cannot be empty' });
      }
      updateData.tomorrow = tomorrow.trim();
    }
    if (highlight !== undefined) updateData.highlight = highlight?.trim() || null;
    if (challenge !== undefined) updateData.challenge = challenge?.trim() || null;

    const review = await prisma.dailyReview.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.json({
      message: 'Review updated successfully',
      review: {
        id: review.id,
        date: review.date,
        mood: review.mood,
        learned: review.learned,
        tomorrow: review.tomorrow,
        highlight: review.highlight,
        challenge: review.challenge,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      message: 'Failed to update review',
      error: error.message,
    });
  }
}

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
export async function deleteReview(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if review exists and belongs to user
    const review = await prisma.dailyReview.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await prisma.dailyReview.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      message: 'Failed to delete review',
      error: error.message,
    });
  }
}

/**
 * Get review statistics
 * GET /api/reviews/stats
 */
export async function getReviewStats(req, res) {
  try {
    const userId = req.user.id;

    const totalReviews = await prisma.dailyReview.count({
      where: { userId },
    });

    // Get reviews from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReviews = await prisma.dailyReview.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        mood: true,
      },
    });

    // Calculate average mood
    const averageMood = recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.mood, 0) / recentReviews.length
      : 0;

    // Count by mood
    const moodCounts = {
      amazing: recentReviews.filter(r => r.mood === 5).length,
      good: recentReviews.filter(r => r.mood === 4).length,
      okay: recentReviews.filter(r => r.mood === 3).length,
      bad: recentReviews.filter(r => r.mood === 2).length,
      terrible: recentReviews.filter(r => r.mood === 1).length,
    };

    // Get current streak
    const allReviews = await prisma.dailyReview.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < allReviews.length; i++) {
      const reviewDate = new Date(allReviews[i].date);
      reviewDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (reviewDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.json({
      message: 'Review statistics retrieved successfully',
      stats: {
        total: totalReviews,
        last30Days: recentReviews.length,
        averageMood: parseFloat(averageMood.toFixed(2)),
        currentStreak,
        moodDistribution: moodCounts,
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: error.message,
    });
  }
}
