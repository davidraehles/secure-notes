/**
 * Note list view - MVI View layer
 */

import { useDispatch, useSelector } from 'react-redux';
import { setCurrentNote } from '../store/slices/notesSlice';
import { deleteNoteIntent } from '../intents/notesIntents';
import type { AppDispatch, RootState } from '../store/store';
import type { Note } from '../models/types';

export function NoteList() {
  const dispatch = useDispatch<AppDispatch>();
  const { notes, currentNote, isLoading } = useSelector(
    (state: RootState) => state.notes
  );

  const handleNoteClick = (note: Note) => {
    dispatch(setCurrentNote(note));
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      await dispatch(deleteNoteIntent(noteId));
      if (currentNote?.id === noteId) {
        dispatch(setCurrentNote(null));
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="empty">No notes yet. Create one to get started.</div>;
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
          onClick={() => handleNoteClick(note)}
        >
          <div className="note-title">{note.title || 'Untitled'}</div>
          <div className="note-preview">
            {note.content.substring(0, 100)}
            {note.content.length > 100 ? '...' : ''}
          </div>
          <div className="note-date">
            {new Date(note.updatedAt).toLocaleDateString()}
          </div>
          <button
            className="delete-btn"
            onClick={(e) => handleDelete(e, note.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

