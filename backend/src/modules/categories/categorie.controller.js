import prisma from '../../lib/prisma.js';

/**
 * Create a new category
 * POST /api/categories
 */
export async function createCategory(req, res) {
  try {
    const { name, description, color } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Category name is required and must be at least 2 characters' 
      });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res.status(409).json({ 
        message: 'Category with this name already exists' 
      });
    }

    // Validate color format (hex color)
    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return res.status(400).json({ 
        message: 'Invalid color format. Use hex color format (e.g., #22C55E)' 
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#22C55E',
      },
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ 
      message: 'Failed to create category', 
      error: error.message 
    });
  }
}

/**
 * Get all categories
 * GET /api/categories
 */
export async function getAllCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      message: 'Categories retrieved successfully',
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve categories', 
      error: error.message 
    });
  }
}

/**
 * Get a single category by ID
 * GET /api/categories/:id
 */
export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;

    // Validate ID
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({
      message: 'Category retrieved successfully',
      category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve category', 
      error: error.message 
    });
  }
}

/**
 * Update a category
 * PUT /api/categories/:id
 */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Validate ID
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Validate name if provided
    if (name && name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Category name must be at least 2 characters' 
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name.trim() !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: name.trim() }
      });

      if (duplicateCategory) {
        return res.status(409).json({ 
          message: 'Category with this name already exists' 
        });
      }
    }

    // Validate color format if provided
    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return res.status(400).json({ 
        message: 'Invalid color format. Use hex color format (e.g., #22C55E)' 
      });
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color && { color }),
      },
    });

    return res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ 
      message: 'Failed to update category', 
      error: error.message 
    });
  }
}

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Validate ID
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return res.json({
      message: 'Category deleted successfully',
      deletedCategory: category,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete category', 
      error: error.message 
    });
  }
}
