import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const MAX_QUICK_NOTE_LENGTH = 100;

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
  const quickNotesRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 动态调整时间轴高度
  useEffect(() => {
    const updateTimelineHeight = () => {
      if (listRef.current && quickNotes.length > 0) {
        const items = listRef.current.querySelectorAll('.quick-note-item');
        if (items.length > 0) {
          const lastItem = items[items.length - 1] as HTMLElement;
          const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
          listRef.current.style.setProperty('--timeline-height', `${lastItemBottom}px`);
        }
      }
    };

    // 初始更新
    updateTimelineHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', updateTimelineHeight);

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(updateTimelineHeight);
    if (listRef.current) {
      observer.observe(listRef.current, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', updateTimelineHeight);
      observer.disconnect();
    };
  }, [quickNotes]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingNoteId(null);
    setOriginalContent('');
    onQuickNoteInputChange('');
  }, [onQuickNoteInputChange]);

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
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
  }, [editingNoteId, quickNoteInput, originalContent, onQuickNoteInputChange, onUpdateQuickNote]);

  // 监听点击外部事件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果正在编辑，且点击的是外部区域
      if (editingNoteId && quickNotesRef.current && !quickNotesRef.current.contains(event.target as Node)) {
        // 检查是否有改动
        if (quickNoteInput.trim() !== originalContent) {
          const shouldSave = window.confirm(
            '当前有未保存的改动，是否保存？\n\n' +
            '点击"确定"保存后退出\n' +
            '点击"取消"放弃更改并退出'
          );
          
          if (shouldSave) {
            handleSaveEdit();
          } else {
            handleCancelEdit();
          }
        } else {
          // 没有改动，直接退出编辑模式
          handleCancelEdit();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingNoteId, quickNoteInput, originalContent, handleSaveEdit, handleCancelEdit]);

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

  // 获取剩余字符数
  const getRemainingChars = () => {
    return MAX_QUICK_NOTE_LENGTH - quickNoteInput.length;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuickNoteInputChange(e.target.value);
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
    <div className="quick-notes" ref={quickNotesRef}>
      <div className="quick-notes__header">
        <h3>💭 速记</h3>
        {editingNoteId && (
          <span className="editing-badge">编辑中，点击组件外部退出</span>
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={editingNoteId ? 'editing' : ''}
          maxLength={MAX_QUICK_NOTE_LENGTH}
        />
        <div className="char-count">
          <span className={getRemainingChars() < 20 ? 'warning' : ''}>
            {quickNoteInput.length}/{MAX_QUICK_NOTE_LENGTH}
          </span>
        </div>
      </div>
      <div className="quick-notes__list" ref={listRef}>
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
