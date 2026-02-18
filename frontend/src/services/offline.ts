/**
 * Offline storage and sync service using IndexedDB
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Note, SyncOperation } from '../models/types';

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updatedAt': string };
  };
  syncQueue: {
    key: string;
    value: SyncOperation;
  };
}

let db: IDBPDatabase<NotesDB> | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBPDatabase<NotesDB>> {
  if (db) return db;

  db = await openDB<NotesDB>('secure-notes-db', 1, {
    upgrade(db) {
      // Notes store
      const notesStore = db.createObjectStore('notes', {
        keyPath: 'id',
      });
      notesStore.createIndex('by-updatedAt', 'updatedAt');

      // Sync queue store
      db.createObjectStore('syncQueue', {
        keyPath: 'id',
      });
    },
  });

  return db;
}

/**
 * Save multiple notes to IndexedDB in a single transaction
 */
export async function saveNotesToDB(notes: Note[]): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('notes', 'readwrite');
  await Promise.all([
    ...notes.map((note) => tx.store.put(note)),
    tx.done,
  ]);
}

/**
 * Save note to IndexedDB
 */
export async function saveNoteToDB(note: Note): Promise<void> {
  const database = await initDB();
  await database.put('notes', note);
}

/**
 * Get all notes from IndexedDB
 */
export async function getNotesFromDB(): Promise<Note[]> {
  const database = await initDB();
  return database.getAll('notes');
}

/**
 * Get note by ID from IndexedDB
 */
export async function getNoteFromDB(id: string): Promise<Note | undefined> {
  const database = await initDB();
  return database.get('notes', id);
}

/**
 * Delete note from IndexedDB
 */
export async function deleteNoteFromDB(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('notes', id);
}

/**
 * Add operation to sync queue
 */
export async function addToSyncQueue(operation: SyncOperation): Promise<void> {
  const database = await initDB();
  await database.put('syncQueue', operation);
}

/**
 * Get all operations from sync queue
 */
export async function getSyncQueue(): Promise<SyncOperation[]> {
  const database = await initDB();
  return database.getAll('syncQueue');
}

/**
 * Remove operation from sync queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('syncQueue', id);
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('syncQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

