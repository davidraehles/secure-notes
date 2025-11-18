/**
 * Notes slice - Redux Model layer for notes
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NotesState, Note, SyncOperation } from '../../models/types';

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  syncQueue: [],
  isOnline: navigator.onLine,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.push(action.payload);
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
      if (state.currentNote?.id === action.payload.id) {
        state.currentNote = action.payload;
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      if (state.currentNote?.id === action.payload) {
        state.currentNote = null;
      }
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addToSyncQueue: (state, action: PayloadAction<SyncOperation>) => {
      state.syncQueue.push(action.payload);
    },
    removeFromSyncQueue: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter((op) => op.id !== action.payload);
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
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
} = notesSlice.actions;
export default notesSlice.reducer;

