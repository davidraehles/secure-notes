/**
 * Type definitions for the application
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedNote {
  id: string;
  encryptedContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  syncQueue: SyncOperation[];
  isOnline: boolean;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId: string;
  note?: Note;
  timestamp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

