import prisma from '../../lib/prisma.js';

/**
 * Get all partial goals for a goal
 * GET /api/goals/:goalId/partial
 */
export async function getPartialGoals(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const partialGoals = await prisma.partialGoal.findMany({
      where: {
        goalId: parseInt(goalId),
      },
      orderBy: {
        order: 'asc',
      },
    });

    return res.json({
      message: 'Partial goals retrieved successfully',
      partialGoals,
    });
  } catch (error) {
    console.error('Get partial goals error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve partial goals',
      error: error.message,
    });
  }
}

/**
 * Create partial goal
 * POST /api/goals/:goalId/partial
 */
export async function createPartialGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const { title, description, order } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Get current count for default order
    const count = await prisma.partialGoal.count({
      where: { goalId: parseInt(goalId) },
    });

    const partialGoal = await prisma.partialGoal.create({
      data: {
        goalId: parseInt(goalId),
        title: title.trim(),
        description: description?.trim() || null,
        order: order !== undefined ? order : count,
      },
    });

    return res.status(201).json({
      message: 'Partial goal created successfully',
      partialGoal,
    });
  } catch (error) {
    console.error('Create partial goal error:', error);
    return res.status(500).json({
      message: 'Failed to create partial goal',
      error: error.message,
    });
  }
}

/**
 * Update partial goal
 * PUT /api/goals/:goalId/partial/:id
 */
export async function updatePartialGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId, id } = req.params;
    const { title, description, order } = req.body;

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if partial goal exists
    const existingPartialGoal = await prisma.partialGoal.findFirst({
      where: {
        id: parseInt(id),
        goalId: parseInt(goalId),
      },
    });

    if (!existingPartialGoal) {
      return res.status(404).json({ message: 'Partial goal not found' });
    }

    const partialGoal = await prisma.partialGoal.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(order !== undefined && { order }),
      },
    });

    return res.json({
      message: 'Partial goal updated successfully',
      partialGoal,
    });
  } catch (error) {
    console.error('Update partial goal error:', error);
    return res.status(500).json({
      message: 'Failed to update partial goal',
      error: error.message,
    });
  }
}

/**
 * Toggle partial goal completion
 * PATCH /api/goals/:goalId/partial/:id/toggle
 */
export async function togglePartialGoalCompletion(req, res) {
  try {
    const userId = req.user.id;
    const { goalId, id } = req.params;

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if partial goal exists
    const existingPartialGoal = await prisma.partialGoal.findFirst({
      where: {
        id: parseInt(id),
        goalId: parseInt(goalId),
      },
    });

    if (!existingPartialGoal) {
      return res.status(404).json({ message: 'Partial goal not found' });
    }

    const partialGoal = await prisma.partialGoal.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: !existingPartialGoal.isCompleted,
        completedAt: !existingPartialGoal.isCompleted ? new Date() : null,
      },
    });

    // Check if all partial goals are completed, then complete main goal
    const allPartialGoals = await prisma.partialGoal.findMany({
      where: { goalId: parseInt(goalId) },
    });

    const allCompleted = allPartialGoals.every(pg => pg.isCompleted);

    if (allCompleted && allPartialGoals.length > 0) {
      await prisma.goal.update({
        where: { id: parseInt(goalId) },
        data: {
          isCompleted: true,
          isActive: false,
          completedAt: new Date(),
        },
      });
    }

    return res.json({
      message: `Partial goal marked as ${partialGoal.isCompleted ? 'completed' : 'pending'}`,
      partialGoal,
      mainGoalCompleted: allCompleted && allPartialGoals.length > 0,
    });
  } catch (error) {
    console.error('Toggle partial goal error:', error);
    return res.status(500).json({
      message: 'Failed to toggle partial goal',
      error: error.message,
    });
  }
}

/**
 * Delete partial goal
 * DELETE /api/goals/:goalId/partial/:id
 */
export async function deletePartialGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId, id } = req.params;

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if partial goal exists
    const partialGoal = await prisma.partialGoal.findFirst({
      where: {
        id: parseInt(id),
        goalId: parseInt(goalId),
      },
    });

    if (!partialGoal) {
      return res.status(404).json({ message: 'Partial goal not found' });
    }

    await prisma.partialGoal.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Partial goal deleted successfully',
    });
  } catch (error) {
    console.error('Delete partial goal error:', error);
    return res.status(500).json({
      message: 'Failed to delete partial goal',
      error: error.message,
    });
  }
}

/**
 * Reorder partial goals
 * PATCH /api/goals/:goalId/partial/reorder
 */
export async function reorderPartialGoals(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const { partialGoalIds } = req.body; // Array of IDs in new order

    if (!Array.isArray(partialGoalIds)) {
      return res.status(400).json({ message: 'partialGoalIds must be an array' });
    }

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(goalId),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update order for each partial goal
    await Promise.all(
      partialGoalIds.map((id, index) =>
        prisma.partialGoal.updateMany({
          where: {
            id: parseInt(id),
            goalId: parseInt(goalId),
          },
          data: { order: index },
        })
      )
    );

    return res.json({
      message: 'Partial goals reordered successfully',
    });
  } catch (error) {
    console.error('Reorder partial goals error:', error);
    return res.status(500).json({
      message: 'Failed to reorder partial goals',
      error: error.message,
    });
  }
}
