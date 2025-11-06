import React, { useState } from 'react';
import { QuickNote } from '@/utils';
import './QuickNotes.scss';

interface QuickNotesProps {
  quickNotes: QuickNote[];
  quickNoteInput: string;
  onQuickNoteInputChange: (value: string) => void;
  onAddQuickNote: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onDeleteQuickNote: (id: string) => void;
  onUpdateQuickNote: (id: string, content: string) => void;
}

const QuickNotes: React.FC<QuickNotesProps> = ({
  quickNotes,
  quickNoteInput,
  onQuickNoteInputChange,
  onAddQuickNote,
  onDeleteQuickNote,
  onUpdateQuickNote,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');

  // 点击速记进入编辑模式
  const handleNoteClick = (note: QuickNote) => {
    // 如果正在编辑其他速记，先检查是否有未保存的改动
    if (editingNoteId && editingNoteId !== note.id) {
      const currentNote = quickNotes.find(n => n.id === editingNoteId);
      if (currentNote && quickNoteInput !== currentNote.content) {
        const shouldSave = window.confirm(
          '当前有未保存的改动，是否保存？\n\n' +
          '点击"确定"保存后切换\n' +
          '点击"取消"放弃更改并切换'
        );
        
        if (shouldSave) {
          handleSaveEdit();
        }
      }
    }
    
    // 进入编辑模式
    setEditingNoteId(note.id);
    setOriginalContent(note.content);
    // 将内容显示到输入框
    onQuickNoteInputChange(note.content);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingNoteId) return;
    
    const trimmedContent = quickNoteInput.trim();
    
    // 验证内容不能为空
    if (!trimmedContent) {
      window.alert('速记内容不能为空！');
      // 恢复原内容
      onQuickNoteInputChange(originalContent);
      return;
    }
    
    // 保存更新
    onUpdateQuickNote(editingNoteId, trimmedContent);
    
    // 退出编辑模式
    setEditingNoteId(null);
    setOriginalContent('');
    onQuickNoteInputChange('');
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setOriginalContent('');
    onQuickNoteInputChange('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (editingNoteId) {
        // 编辑模式：保存编辑
        e.preventDefault();
        handleSaveEdit();
      } else {
        // 新建模式：添加新速记
        onAddQuickNote(e);
      }
    } else if (e.key === 'Escape' && editingNoteId) {
      // 按 ESC 取消编辑
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className="quick-notes">
      <div className="quick-notes__header">
        <h3>💭 速记</h3>
        {editingNoteId && (
          <span className="editing-badge">编辑中</span>
        )}
      </div>
      <div className="quick-notes__input">
        <textarea
          placeholder={
            editingNoteId 
              ? "修改内容后按Ctrl+Enter保存，ESC取消" 
              : "记录你的灵感（按Ctrl+Enter保存）"
          }
          value={quickNoteInput}
          onChange={(e) => onQuickNoteInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={editingNoteId ? 'editing' : ''}
        />
      </div>
      <div className="quick-notes__list">
        {quickNotes.map(note => (
          <div 
            key={note.id} 
            className={`quick-note-item ${editingNoteId === note.id ? 'editing' : ''}`}
            onClick={() => handleNoteClick(note)}
            title="点击编辑"
          >
            <div className="quick-note-item__content">{note.content}</div>
            <div className="quick-note-item__footer">
              <span className="timestamp">
                {new Date(note.timestamp).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuickNote(note.id);
                }}
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
