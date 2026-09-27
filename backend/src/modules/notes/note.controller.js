import prisma from '../../lib/prisma.js';

/**
 * Get all notes for the authenticated user
 * GET /api/notes
 */
export async function getAllNotes(req, res) {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    // Build where clause with optional search
    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const notes = await prisma.note.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      message: 'Notes retrieved successfully',
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve notes',
      error: error.message,
    });
  }
}

/**
 * Get note by ID
 * GET /api/notes/:id
 */
export async function getNoteById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.json({
      message: 'Note retrieved successfully',
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get note error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve note',
      error: error.message,
    });
  }
}

/**
 * Create a new note
 * POST /api/notes
 */
export async function createNote(req, res) {
  try {
    const userId = req.user.id;
    const { title, content, color } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Validate color format (basic hex validation)
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (color && !colorRegex.test(color)) {
      return res.status(400).json({ message: 'Invalid color format. Use hex format like #22C55E' });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title: title?.trim() || null,
        content: content.trim(),
        color: color || '#22C55E',
      },
    });

    return res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({
      message: 'Failed to create note',
      error: error.message,
    });
  }
}

/**
 * Update note
 * PUT /api/notes/:id
 */
export async function updateNote(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, color } = req.body;

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Validate color if provided
    if (color) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(color)) {
        return res.status(400).json({ message: 'Invalid color format. Use hex format like #22C55E' });
      }
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ message: 'Content cannot be empty' });
      }
      updateData.content = content.trim();
    }
    if (color) updateData.color = color;

    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.json({
      message: 'Note updated successfully',
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update note error:', error);
    return res.status(500).json({
      message: 'Failed to update note',
      error: error.message,
    });
  }
}

/**
 * Delete note
 * DELETE /api/notes/:id
 */
export async function deleteNote(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id: parseInt(id) },
    });

    return res.json({
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({
      message: 'Failed to delete note',
      error: error.message,
    });
  }
}

/**
 * Get notes statistics
 * GET /api/notes/stats
 */
export async function getNotesStats(req, res) {
  try {
    const userId = req.user.id;

    const totalNotes = await prisma.note.count({
      where: { userId },
    });

    // Get notes created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentNotes = await prisma.note.count({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get notes by color
    const notesByColor = await prisma.note.groupBy({
      by: ['color'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    return res.json({
      message: 'Notes statistics retrieved successfully',
      stats: {
        total: totalNotes,
        recentWeek: recentNotes,
        byColor: notesByColor.map(item => ({
          color: item.color,
          count: item._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Get notes stats error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: error.message,
    });
  }
}
