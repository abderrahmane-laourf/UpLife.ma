import prisma from '../../lib/prisma.js';

/**
 * Get all activities for the authenticated user for today (or specified date)
 * GET /api/activities?date=2026-09-28
 */
export async function getAllActivities(req, res) {
  try {
    const userId = req.user.id;
    
    // Get date from query parameter or use today
    let targetDate;
    if (req.query.date) {
      targetDate = new Date(req.query.date);
    } else {
      targetDate = new Date();
    }
    targetDate.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: targetDate,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      message: 'Activities retrieved successfully',
      date: targetDate,
      activities: activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve activities',
      error: error.message,
    });
  }
}

/**
 * Get activity by ID
 * GET /api/activities/:id
 */
export async function getActivityById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await prisma.activity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    return res.json({
      message: 'Activity retrieved successfully',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve activity',
      error: error.message,
    });
  }
}

/**
 * Create a new activity
 * POST /api/activities
 */
export async function createActivity(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, time, categoryId } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create activity for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.activity.create({
      data: {
        userId,
        categoryId: parseInt(categoryId),
        title: title.trim(),
        description: description?.trim() || null,
        time: time?.trim() || null,
        date: today,
        done: false,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Activity created successfully',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create activity error:', error);
    return res.status(500).json({
      message: 'Failed to create activity',
      error: error.message,
    });
  }
}

/**
 * Update activity
 * PUT /api/activities/:id
 */
export async function updateActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, time, categoryId, done, dayCompleted } = req.body;

    // Check if activity exists and belongs to user
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // Update activity
    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(time !== undefined && { time: time?.trim() || null }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(done !== undefined && { done: Boolean(done) }),
        ...(dayCompleted !== undefined && { dayCompleted: Boolean(dayCompleted) }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.json({
      message: 'Activity updated successfully',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return res.status(500).json({
      message: 'Failed to update activity',
      error: error.message,
    });
  }
}

/**
 * Delete activity
 * DELETE /api/activities/:id
 */
export async function deleteActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if activity exists and belongs to user
    const activity = await prisma.activity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await prisma.activity.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    return res.status(500).json({
      message: 'Failed to delete activity',
      error: error.message,
    });
  }
}

/**
 * Toggle activity done status
 * PATCH /api/activities/:id/toggle
 */
export async function toggleActivityDone(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if activity exists and belongs to user
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        done: !existingActivity.done,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.json({
      message: `Activity marked as ${activity.done ? 'done' : 'pending'}`,
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Toggle activity error:', error);
    return res.status(500).json({
      message: 'Failed to toggle activity',
      error: error.message,
    });
  }
}

/**
 * Get all missed activities for the authenticated user
 * GET /api/activities/missed
 */
export async function getMissedActivities(req, res) {
  try {
    const userId = req.user.id;

    const missedActivities = await prisma.missedActivity.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        missedDate: 'desc',
      },
    });

    return res.json({
      message: 'Missed activities retrieved successfully',
      missedActivities: missedActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        reason: activity.reason,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        missedDate: activity.missedDate,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get missed activities error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve missed activities',
      error: error.message,
    });
  }
}

/**
 * Add reason to missed activity
 * PATCH /api/activities/missed/:id/reason
 */
export async function updateMissedActivityReason(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    // Check if missed activity exists and belongs to user
    const existingActivity = await prisma.missedActivity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: 'Missed activity not found' });
    }

    const missedActivity = await prisma.missedActivity.update({
      where: { id: parseInt(id) },
      data: {
        reason: reason.trim(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.json({
      message: 'Reason added successfully',
      missedActivity: {
        id: missedActivity.id,
        title: missedActivity.title,
        description: missedActivity.description,
        time: missedActivity.time,
        reason: missedActivity.reason,
        category: missedActivity.category.name,
        categoryColor: missedActivity.category.color,
        categoryId: missedActivity.category.id,
        missedDate: missedActivity.missedDate,
        createdAt: missedActivity.createdAt,
      },
    });
  } catch (error) {
    console.error('Update missed activity reason error:', error);
    return res.status(500).json({
      message: 'Failed to update reason',
      error: error.message,
    });
  }
}

/**
 * Update missed activity (edit title, description, time)
 * PUT /api/activities/missed/:id
 */
export async function updateMissedActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, time, reason } = req.body;

    // Check if missed activity exists and belongs to user
    const existingActivity = await prisma.missedActivity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: 'Missed activity not found' });
    }

    const missedActivity = await prisma.missedActivity.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(time !== undefined && { time: time?.trim() || null }),
        ...(reason !== undefined && { reason: reason?.trim() || null }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.json({
      message: 'Missed activity updated successfully',
      missedActivity: {
        id: missedActivity.id,
        title: missedActivity.title,
        description: missedActivity.description,
        time: missedActivity.time,
        reason: missedActivity.reason,
        category: missedActivity.category.name,
        categoryColor: missedActivity.category.color,
        categoryId: missedActivity.category.id,
        missedDate: missedActivity.missedDate,
        createdAt: missedActivity.createdAt,
      },
    });
  } catch (error) {
    console.error('Update missed activity error:', error);
    return res.status(500).json({
      message: 'Failed to update missed activity',
      error: error.message,
    });
  }
}

/**
 * Delete missed activity
 * DELETE /api/activities/missed/:id
 */
export async function deleteMissedActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if missed activity exists and belongs to user
    const missedActivity = await prisma.missedActivity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!missedActivity) {
      return res.status(404).json({ message: 'Missed activity not found' });
    }

    await prisma.missedActivity.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Missed activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete missed activity error:', error);
    return res.status(500).json({
      message: 'Failed to delete missed activity',
      error: error.message,
    });
  }
}

/**
 * Restore missed activity to completed (create as done activity)
 * POST /api/activities/missed/:id/restore
 */
export async function restoreMissedActivity(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if missed activity exists and belongs to user
    const missedActivity = await prisma.missedActivity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!missedActivity) {
      return res.status(404).json({ message: 'Missed activity not found' });
    }

    // Create a new activity as completed on the original missed date
    const activity = await prisma.activity.create({
      data: {
        userId,
        categoryId: missedActivity.categoryId,
        title: missedActivity.title,
        description: missedActivity.description,
        time: missedActivity.time,
        date: missedActivity.missedDate,
        done: true, // Mark as completed
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Delete the missed activity
    await prisma.missedActivity.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Missed activity restored as completed',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Restore missed activity error:', error);
    return res.status(500).json({
      message: 'Failed to restore missed activity',
      error: error.message,
    });
  }
}

/**
 * Move unfinished activities to missed (Called by a cron job or manually)
 * POST /api/activities/move-to-missed
 * 
 * When called manually (Slit Nhar button): moves TODAY's unfinished tasks to missed
 * When called by cron: can specify a date to move
 */
export async function moveUnfinishedToMissed(req, res) {
  try {
    const userId = req.user.id;
    
    // Use TODAY for manual "Slit Nhar" button, or accept a date from request
    const targetDate = req.body.date ? new Date(req.body.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Find unfinished activities from the target date
    const unfinishedActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: targetDate,
        done: false,
      },
      include: {
        category: true,
      },
    });

    if (unfinishedActivities.length === 0) {
      return res.json({
        message: 'No unfinished activities to move',
        moved: 0,
      });
    }

    // Create missed activities
    const missedActivities = await prisma.missedActivity.createMany({
      data: unfinishedActivities.map(activity => ({
        userId: activity.userId,
        categoryId: activity.categoryId,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        reason: null,
        missedDate: activity.date,
      })),
    });

    // Delete the activities that were moved to missed
    await prisma.activity.deleteMany({
      where: {
        userId,
        date: targetDate,
        done: false,
      },
    });

    return res.json({
      message: 'Unfinished activities moved to missed and cleared from today',
      moved: missedActivities.count,
    });
  } catch (error) {
    console.error('Move to missed error:', error);
    return res.status(500).json({
      message: 'Failed to move activities',
      error: error.message,
    });
  }
}

/**
 * Mark all activities as day completed for today
 * PATCH /api/activities/mark-day-complete
 */
export async function markDayComplete(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update all today's activities to mark day as complete
    const result = await prisma.activity.updateMany({
      where: {
        userId,
        date: today,
      },
      data: {
        dayCompleted: true,
      },
    });

    return res.json({
      message: 'Day marked as complete',
      updated: result.count,
    });
  } catch (error) {
    console.error('Mark day complete error:', error);
    return res.status(500).json({
      message: 'Failed to mark day as complete',
      error: error.message,
    });
  }
}

/**
 * Update prayer status for an activity
 * PATCH /api/activities/:id/prayer-status
 */
export async function updatePrayerStatus(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { prayerStatus } = req.body;

    // Validate prayer status
    if (prayerStatus !== true && prayerStatus !== false && prayerStatus !== null) {
      return res.status(400).json({ message: 'Prayer status must be true, false, or null' });
    }

    // Check if activity exists and belongs to user
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        prayerStatus: prayerStatus,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.json({
      message: 'Prayer status updated successfully',
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        done: activity.done,
        prayerStatus: activity.prayerStatus,
        dayCompleted: activity.dayCompleted,
        category: activity.category.name,
        categoryColor: activity.category.color,
        categoryId: activity.category.id,
        date: activity.date,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update prayer status error:', error);
    return res.status(500).json({
      message: 'Failed to update prayer status',
      error: error.message,
    });
  }
}
