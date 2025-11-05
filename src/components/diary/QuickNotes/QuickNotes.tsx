import React from 'react';
import { QuickNote } from '../types';
import './QuickNotes.scss';

interface QuickNotesProps {
  quickNotes: QuickNote[];
  quickNoteInput: string;
  onQuickNoteInputChange: (value: string) => void;
  onAddQuickNote: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onDeleteQuickNote: (id: string) => void;
}

const QuickNotes: React.FC<QuickNotesProps> = ({
  quickNotes,
  quickNoteInput,
  onQuickNoteInputChange,
  onAddQuickNote,
  onDeleteQuickNote,
}) => {
  return (
    <div className="quick-notes">
      <div className="quick-notes__header">
        <h3>💭 速记</h3>
      </div>
      <div className="quick-notes__input">
        <textarea
          placeholder="记录你的灵感（按Ctrl+Enter保存）"
          value={quickNoteInput}
          onChange={(e) => onQuickNoteInputChange(e.target.value)}
          onKeyDown={onAddQuickNote}
        />
      </div>
      <div className="quick-notes__list">
        {quickNotes.map(note => (
          <div key={note.id} className="quick-note-item">
            <div className="quick-note-item__content">{note.content}</div>
            <div className="quick-note-item__footer">
              <span className="timestamp">{note.timestamp}</span>
              <button 
                className="delete-btn"
                onClick={() => onDeleteQuickNote(note.id)}
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickNotes;
