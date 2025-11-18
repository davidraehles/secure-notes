/**
 * Notes intents - MVI Intent layer for notes operations
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../services/api';
import { encrypt, decrypt } from '../services/encryption';
import {
  saveNoteToDB,
  getNotesFromDB,
  deleteNoteFromDB,
  addToSyncQueue as addToSyncQueueDB,
  getSyncQueue as getSyncQueueDB,
  removeFromSyncQueue as removeFromSyncQueueDB,
} from '../services/offline';
import {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setLoading,
  setError,
  addToSyncQueue,
  removeFromSyncQueue,
  setOnline,
} from '../store/slices/notesSlice';
import type { Note, EncryptedNote } from '../models/types';
import { RootState } from '../store/store';

// Get password from state (stored securely, not in Redux)
let userPassword: string | null = null;

export function setUserPassword(password: string | null) {
  userPassword = password;
}

function getUserPassword(): string {
  if (!userPassword) {
    throw new Error('User password not set');
  }
  return userPassword;
}

/**
 * Load notes from server and decrypt them
 */
export const loadNotesIntent = createAsyncThunk(
  'notes/load',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const state = getState() as RootState;
      const isOnline = state.notes.isOnline;

      if (!isOnline) {
        // Load from IndexedDB
        const localNotes = await getNotesFromDB();
        dispatch(setNotes(localNotes));
        dispatch(setLoading(false));
        return localNotes;
      }

      // Load from server
      const encryptedNotes = await apiClient.getNotes();
      const password = getUserPassword();
      
      const decryptedNotes: Note[] = await Promise.all(
        encryptedNotes.map(async (encryptedNote) => {
          const decryptedContent = await decrypt(
            encryptedNote.encryptedContent,
            password
          );
          const note: Note = JSON.parse(decryptedContent);
          return {
            ...note,
            id: encryptedNote.id,
            createdAt: encryptedNote.createdAt,
            updatedAt: encryptedNote.updatedAt,
          };
        })
      );

      // Save to IndexedDB
      for (const note of decryptedNotes) {
        await saveNoteToDB(note);
      }

      dispatch(setNotes(decryptedNotes));
      dispatch(setLoading(false));
      return decryptedNotes;
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load notes'));
      dispatch(setLoading(false));
      
      // Fallback to IndexedDB
      try {
        const localNotes = await getNotesFromDB();
        dispatch(setNotes(localNotes));
        return localNotes;
      } catch {
        return rejectWithValue(
          error instanceof Error ? error.message : 'Failed to load notes'
        );
      }
    }
  }
);

/**
 * Create a new note
 */
export const createNoteIntent = createAsyncThunk(
  'notes/create',
  async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isOnline = state.notes.isOnline;
      const password = getUserPassword();

      const newNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB immediately
      await saveNoteToDB(newNote);
      dispatch(addNote(newNote));

      if (isOnline) {
        try {
          // Encrypt and send to server
          const encryptedContent = await encrypt(JSON.stringify(newNote), password);
          const encryptedNote: Omit<EncryptedNote, 'id' | 'createdAt' | 'updatedAt'> = {
            encryptedContent,
          };
          
          const result = await apiClient.createNote(encryptedNote);
          
          // Update note with server ID and timestamps
          const updatedNote: Note = {
            ...newNote,
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
          };
          
          await saveNoteToDB(updatedNote);
          dispatch(updateNote(updatedNote));
        } catch (error) {
          // Add to sync queue if online but request failed
          const syncOp = {
            id: crypto.randomUUID(),
            type: 'create' as const,
            noteId: newNote.id,
            note: newNote,
            timestamp: Date.now(),
          };
          await addToSyncQueueDB(syncOp);
          dispatch(addToSyncQueue(syncOp));
        }
      } else {
        // Add to sync queue
        const syncOp = {
          id: crypto.randomUUID(),
          type: 'create' as const,
          noteId: newNote.id,
          note: newNote,
          timestamp: Date.now(),
        };
        await addToSyncQueueDB(syncOp);
        dispatch(addToSyncQueue(syncOp));
      }

      return newNote;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create note'
      );
    }
  }
);

/**
 * Update an existing note
 */
export const updateNoteIntent = createAsyncThunk(
  'notes/update',
  async (note: Note, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isOnline = state.notes.isOnline;
      const password = getUserPassword();

      const updatedNote: Note = {
        ...note,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB immediately
      await saveNoteToDB(updatedNote);
      dispatch(updateNote(updatedNote));

      if (isOnline) {
        try {
          // Encrypt and send to server
          const encryptedContent = await encrypt(JSON.stringify(updatedNote), password);
          await apiClient.updateNote(updatedNote.id, { encryptedContent });
        } catch (error) {
          // Add to sync queue
          const syncOp = {
            id: crypto.randomUUID(),
            type: 'update' as const,
            noteId: updatedNote.id,
            note: updatedNote,
            timestamp: Date.now(),
          };
          await addToSyncQueueDB(syncOp);
          dispatch(addToSyncQueue(syncOp));
        }
      } else {
        // Add to sync queue
        const syncOp = {
          id: crypto.randomUUID(),
          type: 'update' as const,
          noteId: updatedNote.id,
          note: updatedNote,
          timestamp: Date.now(),
        };
        await addToSyncQueueDB(syncOp);
        dispatch(addToSyncQueue(syncOp));
      }

      return updatedNote;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update note'
      );
    }
  }
);

/**
 * Delete a note
 */
export const deleteNoteIntent = createAsyncThunk(
  'notes/delete',
  async (noteId: string, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isOnline = state.notes.isOnline;

      // Delete from IndexedDB immediately
      await deleteNoteFromDB(noteId);
      dispatch(deleteNote(noteId));

      if (isOnline) {
        try {
          await apiClient.deleteNote(noteId);
        } catch (error) {
          // Add to sync queue
          const syncOp = {
            id: crypto.randomUUID(),
            type: 'delete' as const,
            noteId,
            timestamp: Date.now(),
          };
          await addToSyncQueueDB(syncOp);
          dispatch(addToSyncQueue(syncOp));
        }
      } else {
        // Add to sync queue
        const syncOp = {
          id: crypto.randomUUID(),
          type: 'delete' as const,
          noteId,
          timestamp: Date.now(),
        };
        await addToSyncQueueDB(syncOp);
        dispatch(addToSyncQueue(syncOp));
      }

      return noteId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete note'
      );
    }
  }
);

/**
 * Sync pending operations from queue
 */
export const syncQueueIntent = createAsyncThunk(
  'notes/syncQueue',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (!state.notes.isOnline) {
        return;
      }

      const password = getUserPassword();
      const queue = await getSyncQueueDB();

      for (const op of queue) {
        try {
          if (op.type === 'create' && op.note) {
            const encryptedContent = await encrypt(JSON.stringify(op.note), password);
            await apiClient.createNote({ encryptedContent });
            await removeFromSyncQueueDB(op.id);
            dispatch(removeFromSyncQueue(op.id));
          } else if (op.type === 'update' && op.note) {
            const encryptedContent = await encrypt(JSON.stringify(op.note), password);
            await apiClient.updateNote(op.noteId, { encryptedContent });
            await removeFromSyncQueueDB(op.id);
            dispatch(removeFromSyncQueue(op.id));
          } else if (op.type === 'delete') {
            await apiClient.deleteNote(op.noteId);
            await removeFromSyncQueueDB(op.id);
            dispatch(removeFromSyncQueue(op.id));
          }
        } catch (error) {
          // Continue with other operations if one fails
          console.error('Sync operation failed:', error);
        }
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Sync failed'
      );
    }
  }
);

/**
 * Initialize online/offline listeners
 */
export function initOnlineStatus(dispatch: any) {
  const updateOnlineStatus = () => {
    dispatch(setOnline(navigator.onLine));
    if (navigator.onLine) {
      dispatch(syncQueueIntent());
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
}

