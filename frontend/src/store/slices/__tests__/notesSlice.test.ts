/**
 * Unit tests for notes slice
 */

import { describe, it, expect } from 'vitest';
import notesReducer, {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setCurrentNote,
  setLoading,
  setError,
  addToSyncQueue,
  removeFromSyncQueue,
  setOnline,
} from '../notesSlice';
import type { NotesState, Note, SyncOperation } from '../../../models/types';

describe('Notes Slice', () => {
  const initialState: NotesState = {
    notes: [],
    currentNote: null,
    isLoading: false,
    error: null,
    syncQueue: [],
    isOnline: true,
  };

  const testNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('should return initial state', () => {
    expect(notesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should set notes', () => {
    const notes = [testNote];
    const action = setNotes(notes);
    const state = notesReducer(initialState, action);
    
    expect(state.notes).toEqual(notes);
  });

  it('should add note', () => {
    const action = addNote(testNote);
    const state = notesReducer(initialState, action);
    
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]).toEqual(testNote);
  });

  it('should update note', () => {
    const stateWithNote = {
      ...initialState,
      notes: [testNote],
    };
    
    const updatedNote = { ...testNote, title: 'Updated Title' };
    const action = updateNote(updatedNote);
    const state = notesReducer(stateWithNote, action);
    
    expect(state.notes[0].title).toBe('Updated Title');
  });

  it('should delete note', () => {
    const stateWithNote = {
      ...initialState,
      notes: [testNote],
    };
    
    const action = deleteNote('1');
    const state = notesReducer(stateWithNote, action);
    
    expect(state.notes).toHaveLength(0);
  });

  it('should set current note', () => {
    const action = setCurrentNote(testNote);
    const state = notesReducer(initialState, action);
    
    expect(state.currentNote).toEqual(testNote);
  });

  it('should set loading state', () => {
    const action = setLoading(true);
    const state = notesReducer(initialState, action);
    
    expect(state.isLoading).toBe(true);
  });

  it('should set error', () => {
    const error = 'Test error';
    const action = setError(error);
    const state = notesReducer(initialState, action);
    
    expect(state.error).toBe(error);
  });

  it('should add to sync queue', () => {
    const syncOp: SyncOperation = {
      id: '1',
      type: 'create',
      noteId: '1',
      note: testNote,
      timestamp: Date.now(),
    };
    
    const action = addToSyncQueue(syncOp);
    const state = notesReducer(initialState, action);
    
    expect(state.syncQueue).toHaveLength(1);
    expect(state.syncQueue[0]).toEqual(syncOp);
  });

  it('should remove from sync queue', () => {
    const syncOp: SyncOperation = {
      id: '1',
      type: 'create',
      noteId: '1',
      note: testNote,
      timestamp: Date.now(),
    };
    
    const stateWithQueue = {
      ...initialState,
      syncQueue: [syncOp],
    };
    
    const action = removeFromSyncQueue('1');
    const state = notesReducer(stateWithQueue, action);
    
    expect(state.syncQueue).toHaveLength(0);
  });

  it('should set online status', () => {
    const action = setOnline(false);
    const state = notesReducer(initialState, action);
    
    expect(state.isOnline).toBe(false);
  });
});

