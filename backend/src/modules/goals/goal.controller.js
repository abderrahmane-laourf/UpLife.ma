import prisma from '../../lib/prisma.js';

/**
 * Get user's active goal
 * GET /api/goals/active
 */
export async function getActiveGoal(req, res) {
  try {
    const userId = req.user.id;

    const goal = await prisma.goal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        partialGoals: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!goal) {
      return res.json({
        message: 'No active goal found',
        goal: null,
      });
    }

    return res.json({
      message: 'Active goal retrieved successfully',
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        isCompleted: goal.isCompleted,
        completedAt: goal.completedAt,
        category: goal.category.name,
        categoryColor: goal.category.color,
        categoryId: goal.category.id,
        partialGoals: goal.partialGoals,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get active goal error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve active goal',
      error: error.message,
    });
  }
}

/**
 * Get all user goals (history)
 * GET /api/goals
 */
export async function getAllGoals(req, res) {
  try {
    const userId = req.user.id;

    const goals = await prisma.goal.findMany({
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
        createdAt: 'desc',
      },
    });

    return res.json({
      message: 'Goals retrieved successfully',
      goals: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        isActive: goal.isActive,
        isCompleted: goal.isCompleted,
        completedAt: goal.completedAt,
        category: goal.category.name,
        categoryColor: goal.category.color,
        categoryId: goal.category.id,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve goals',
      error: error.message,
    });
  }
}

/**
 * Create or update goal
 * POST /api/goals
 */
export async function createOrUpdateGoal(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, categoryId, deadline } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Deactivate any existing active goal
    await prisma.goal.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        categoryId: parseInt(categoryId),
        title: title.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        isActive: true,
        isCompleted: false,
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
      message: 'Goal created successfully',
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        isCompleted: goal.isCompleted,
        category: goal.category.name,
        categoryColor: goal.category.color,
        categoryId: goal.category.id,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return res.status(500).json({
      message: 'Failed to create goal',
      error: error.message,
    });
  }
}

/**
 * Update goal
 * PUT /api/goals/:id
 */
export async function updateGoal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, categoryId, deadline } = req.body;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: 'Goal not found' });
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

    // Update goal
    const goal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
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
      message: 'Goal updated successfully',
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        isCompleted: goal.isCompleted,
        category: goal.category.name,
        categoryColor: goal.category.color,
        categoryId: goal.category.id,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return res.status(500).json({
      message: 'Failed to update goal',
      error: error.message,
    });
  }
}

/**
 * Complete goal
 * PATCH /api/goals/:id/complete
 */
export async function completeGoal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const goal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        isActive: false,
        completedAt: new Date(),
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
      message: 'Goal completed! Congratulations! 🎉',
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        isCompleted: goal.isCompleted,
        completedAt: goal.completedAt,
        category: goal.category.name,
        categoryColor: goal.category.color,
        categoryId: goal.category.id,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
    });
  } catch (error) {
    console.error('Complete goal error:', error);
    return res.status(500).json({
      message: 'Failed to complete goal',
      error: error.message,
    });
  }
}

/**
 * Delete goal
 * DELETE /api/goals/:id
 */
export async function deleteGoal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await prisma.goal.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    return res.status(500).json({
      message: 'Failed to delete goal',
      error: error.message,
    });
  }
}
