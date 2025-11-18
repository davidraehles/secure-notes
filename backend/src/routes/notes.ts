/**
 * Notes routes
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all notes for the authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new note
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { encryptedContent } = req.body;

    if (!encryptedContent) {
      return res.status(400).json({ message: 'encryptedContent is required' });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        encryptedContent,
      },
    });

    res.json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { encryptedContent } = req.body;

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        encryptedContent: encryptedContent || existingNote.encryptedContent,
      },
    });

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

