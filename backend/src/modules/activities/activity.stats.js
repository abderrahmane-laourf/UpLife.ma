import prisma from '../../lib/prisma.js';

/**
 * Get dashboard statistics for activities
 * GET /api/activities/stats/dashboard
 */
export async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's activities
    const todayActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: today,
      },
    });

    const completedToday = todayActivities.filter(a => a.done).length;
    const pendingToday = todayActivities.filter(a => !a.done).length;
    const totalToday = todayActivities.length;
    const completionRateToday = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // Calculate current streak - consecutive days with at least one completed task
    let currentStreak = 0;
    
    // Get all unique dates that have activities
    const allActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Group activities by date
    const activitiesByDate = {};
    for (const activity of allActivities) {
      const dateKey = activity.date.toISOString().split('T')[0];
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push(activity);
    }

    // Check streak starting from today
    for (let i = 0; i < 365; i++) { // Max 365 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const dateKey = checkDate.toISOString().split('T')[0];
      const dayActivities = activitiesByDate[dateKey] || [];
      
      if (dayActivities.length === 0) {
        // No activities this day - streak might be broken
        if (i === 0) {
          // Today has no activities, check if we're still in the day
          continue;
        } else {
          // Streak is broken
          break;
        }
      }
      
      const hasCompleted = dayActivities.some(a => a.done);
      if (hasCompleted) {
        currentStreak++;
      } else {
        // No completed tasks this day
        if (i === 0 && new Date().getHours() < 12) {
          // Today but it's still morning, don't break streak yet
          continue;
        }
        break;
      }
    }

    // Get last 7 days data
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      include: {
        category: true,
      },
    });

    // Group by day
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      
      const dayActivities = weeklyActivities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === date.getTime();
      });
      
      weeklyData.push({
        day: dayNames[date.getDay()],
        completed: dayActivities.filter(a => a.done).length,
        total: dayActivities.length,
      });
    }

    // Get tasks by category (all time)
    const categoryStats = await prisma.activity.groupBy({
      by: ['categoryId'],
      where: { userId },
      _count: { id: true },
    });

    const categories = await prisma.category.findMany();
    const categoryData = categoryStats.map(stat => {
      const category = categories.find(c => c.id === stat.categoryId);
      return {
        name: category?.name || 'Unknown',
        value: stat._count.id,
        color: category?.color || '#22C55E',
      };
    });

    // Get completion rate trend (last 7 weeks)
    const sevenWeeksAgo = new Date(today);
    sevenWeeksAgo.setDate(today.getDate() - 49); // 7 weeks

    const allActivitiesForTrend = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: sevenWeeksAgo,
        },
      },
    });

    const trendData = [];
    for (let week = 0; week < 7; week++) {
      const weekStart = new Date(sevenWeeksAgo);
      weekStart.setDate(sevenWeeksAgo.getDate() + (week * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekActivities = allActivitiesForTrend.filter(a => {
        const actDate = new Date(a.date);
        return actDate >= weekStart && actDate <= weekEnd;
      });
      
      const weekCompleted = weekActivities.filter(a => a.done).length;
      const weekTotal = weekActivities.length;
      const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
      
      trendData.push({
        week: `W${week + 1}`,
        rate: weekRate,
        completed: weekCompleted,
        total: weekTotal,
      });
    }

    // Calculate yesterday's completion rate for trend comparison
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const yesterdayActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: yesterday,
      },
    });

    const completedYesterday = yesterdayActivities.filter(a => a.done).length;
    const totalYesterday = yesterdayActivities.length;
    const completionRateYesterday = totalYesterday > 0 ? Math.round((completedYesterday / totalYesterday) * 100) : 0;
    const rateTrend = completionRateToday - completionRateYesterday;

    return res.json({
      message: 'Dashboard stats retrieved successfully',
      stats: {
        completedToday,
        pendingToday,
        totalToday,
        completionRateToday,
        currentStreak,
        rateTrend,
        weeklyData,
        categoryData,
        trendData,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve dashboard statistics',
      error: error.message,
    });
  }
}

/**
 * Get daily completion rates for the last 30 days
 * GET /api/activities/stats/daily-trend
 */
export async function getDailyCompletionTrend(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Group by day
    const dailyData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dayActivities = activities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === date.getTime();
      });
      
      const completed = dayActivities.filter(a => a.done).length;
      const total = dayActivities.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total,
        rate,
      });
    }

    return res.json({
      message: 'Daily completion trend retrieved successfully',
      data: dailyData,
    });
  } catch (error) {
    console.error('Get daily trend error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve daily trend',
      error: error.message,
    });
  }
}
