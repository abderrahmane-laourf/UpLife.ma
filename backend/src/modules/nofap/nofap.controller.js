import prisma from '../../lib/prisma.js';

/**
 * NoFap Counter Controller
 * Tracks clean days streak for NoFap/NoPorn challenge
 */

/**
 * Get user's NoFap counter
 */
export async function getCounter(req, res) {
  try {
    const userId = req.user.id;

    let counter = await prisma.noFapCounter.findUnique({
      where: { userId },
    });

    // Create counter if doesn't exist
    if (!counter) {
      counter = await prisma.noFapCounter.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalRelapses: 0,
        },
      });
    } else {
      // Update current streak based on days since start
      const daysSinceStart = Math.floor(
        (new Date() - new Date(counter.startDate)) / (1000 * 60 * 60 * 24)
      );
      
      if (counter.isActive && daysSinceStart !== counter.currentStreak) {
        counter = await prisma.noFapCounter.update({
          where: { userId },
          data: { currentStreak: daysSinceStart },
        });
      }
    }

    return res.json({
      message: 'Counter retrieved successfully',
      counter,
    });
  } catch (error) {
    console.error('Get counter error:', error);
    return res.status(500).json({
      error: 'Failed to get counter',
      details: error.message,
    });
  }
}

/**
 * Start/Reset counter
 */
export async function startCounter(req, res) {
  try {
    const userId = req.user.id;

    const existingCounter = await prisma.noFapCounter.findUnique({
      where: { userId },
    });

    let counter;
    if (existingCounter) {
      // Reset counter
      counter = await prisma.noFapCounter.update({
        where: { userId },
        data: {
          currentStreak: 0,
          startDate: new Date(),
          isActive: true,
        },
      });
    } else {
      // Create new counter
      counter = await prisma.noFapCounter.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          startDate: new Date(),
          totalRelapses: 0,
          isActive: true,
        },
      });
    }

    return res.json({
      message: 'Counter started successfully! 💪',
      counter,
    });
  } catch (error) {
    console.error('Start counter error:', error);
    return res.status(500).json({
      error: 'Failed to start counter',
      details: error.message,
    });
  }
}

/**
 * Report relapse (reset streak)
 */
export async function reportRelapse(req, res) {
  try {
    const userId = req.user.id;

    const existingCounter = await prisma.noFapCounter.findUnique({
      where: { userId },
    });

    if (!existingCounter) {
      return res.status(404).json({
        error: 'Counter not found. Please start the counter first.',
      });
    }

    // Update longest streak if current is higher
    const newLongestStreak = Math.max(
      existingCounter.longestStreak,
      existingCounter.currentStreak
    );

    const counter = await prisma.noFapCounter.update({
      where: { userId },
      data: {
        currentStreak: 0,
        longestStreak: newLongestStreak,
        lastRelapseDate: new Date(),
        totalRelapses: existingCounter.totalRelapses + 1,
        startDate: new Date(),
      },
    });

    return res.json({
      message: 'Relapse reported. Start fresh! You got this! 💪',
      counter,
    });
  } catch (error) {
    console.error('Report relapse error:', error);
    return res.status(500).json({
      error: 'Failed to report relapse',
      details: error.message,
    });
  }
}

/**
 * Pause counter
 */
export async function pauseCounter(req, res) {
  try {
    const userId = req.user.id;

    const counter = await prisma.noFapCounter.update({
      where: { userId },
      data: { isActive: false },
    });

    return res.json({
      message: 'Counter paused',
      counter,
    });
  } catch (error) {
    console.error('Pause counter error:', error);
    return res.status(500).json({
      error: 'Failed to pause counter',
      details: error.message,
    });
  }
}

/**
 * Resume counter
 */
export async function resumeCounter(req, res) {
  try {
    const userId = req.user.id;

    const counter = await prisma.noFapCounter.update({
      where: { userId },
      data: { isActive: true },
    });

    return res.json({
      message: 'Counter resumed! Keep going! 💪',
      counter,
    });
  } catch (error) {
    console.error('Resume counter error:', error);
    return res.status(500).json({
      error: 'Failed to resume counter',
      details: error.message,
    });
  }
}

/**
 * Delete counter
 */
export async function deleteCounter(req, res) {
  try {
    const userId = req.user.id;

    await prisma.noFapCounter.delete({
      where: { userId },
    });

    return res.json({
      message: 'Counter deleted successfully',
    });
  } catch (error) {
    console.error('Delete counter error:', error);
    return res.status(500).json({
      error: 'Failed to delete counter',
      details: error.message,
    });
  }
}

/**
 * Get stats (for dashboard)
 */
export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    const counter = await prisma.noFapCounter.findUnique({
      where: { userId },
    });

    if (!counter) {
      return res.json({
        message: 'No counter found',
        stats: null,
      });
    }

    // Calculate stats
    const totalDays = Math.floor(
      (new Date() - new Date(counter.createdAt)) / (1000 * 60 * 60 * 24)
    );

    const successRate = totalDays > 0 
      ? ((totalDays - counter.totalRelapses) / totalDays * 100).toFixed(1)
      : 0;

    const stats = {
      currentStreak: counter.currentStreak,
      longestStreak: counter.longestStreak,
      totalRelapses: counter.totalRelapses,
      totalDays,
      successRate: parseFloat(successRate),
      startDate: counter.startDate,
      lastRelapseDate: counter.lastRelapseDate,
      isActive: counter.isActive,
    };

    return res.json({
      message: 'Stats retrieved successfully',
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      error: 'Failed to get stats',
      details: error.message,
    });
  }
}
