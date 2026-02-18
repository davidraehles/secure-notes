/**
 * Unit tests for offline service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveNoteToDB, saveNotesToDB, getNotesFromDB } from '../offline';
import type { Note } from '../../models/types';

// Mock the idb openDB
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

import { openDB } from 'idb';

describe('Offline Service', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test Content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockDb = {
    put: vi.fn(),
    getAll: vi.fn(),
    transaction: vi.fn(),
  };

  const mockStore = {
    put: vi.fn(),
    clear: vi.fn(),
  };

  const mockTx = {
    objectStore: vi.fn(() => mockStore),
    done: Promise.resolve(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openDB).mockResolvedValue(mockDb as any);
    mockDb.transaction.mockReturnValue(mockTx as any);
  });

  it('should save a single note', async () => {
    await saveNoteToDB(mockNote);
    expect(mockDb.put).toHaveBeenCalledWith('notes', mockNote);
  });

  it('should save multiple notes in a single transaction', async () => {
    const notes = [mockNote, { ...mockNote, id: '2' }];
    await saveNotesToDB(notes);

    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    expect(mockDb.transaction).toHaveBeenCalledWith('notes', 'readwrite');
    expect(mockTx.objectStore).toHaveBeenCalledWith('notes');
    expect(mockStore.put).toHaveBeenCalledTimes(2);
    expect(mockStore.put).toHaveBeenCalledWith(notes[0]);
    expect(mockStore.put).toHaveBeenCalledWith(notes[1]);
  });

  it('should get all notes', async () => {
    const notes = [mockNote];
    mockDb.getAll.mockResolvedValue(notes);

    const result = await getNotesFromDB();
    expect(result).toEqual(notes);
    expect(mockDb.getAll).toHaveBeenCalledWith('notes');
  });

  it('should return early if saving empty notes array', async () => {
    await saveNotesToDB([]);
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });
});
