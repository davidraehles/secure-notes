/**
 * Note editor view - MVI View layer
 */

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentNote } from '../store/slices/notesSlice';
import { createNoteIntent, updateNoteIntent } from '../intents/notesIntents';
import type { AppDispatch, RootState } from '../store/store';

export function NoteEditor() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentNote } = useSelector((state: RootState) => state.notes);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (currentNote) {
        // Update existing note
        await dispatch(
          updateNoteIntent({
            ...currentNote,
            title: title.trim(),
            content: content.trim(),
          })
        ).unwrap();
      } else {
        // Create new note
        const newNote = await dispatch(
          createNoteIntent({
            title: title.trim(),
            content: content.trim(),
          })
        ).unwrap();
        dispatch(setCurrentNote(newNote));
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNewNote = () => {
    dispatch(setCurrentNote(null));
    setTitle('');
    setContent('');
    // Focus title input when starting a new note
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="note-editor">
      <div className="editor-header">
        <button onClick={handleNewNote}>New Note</button>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <input
        ref={titleInputRef}
        type="text"
        className="note-title-input"
        placeholder="Note title"
        aria-label="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="note-content-input"
        placeholder="Write your note here..."
        aria-label="Note content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}

