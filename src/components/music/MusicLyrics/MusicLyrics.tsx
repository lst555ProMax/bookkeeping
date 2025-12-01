import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { QuickNote } from '@/utils';
import { FilterSearchInput } from '@/components/common';
import './MusicLyrics.scss';

interface MusicLyricsProps {
  quickNotes: QuickNote[];
  quickNoteInput: string;
  onQuickNoteInputChange: (value: string) => void;
  onAddQuickNote: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onDeleteQuickNote: (id: string) => void;
  onUpdateQuickNote: (id: string, content: string) => void;
  searchContent?: string;
  onSearchContentChange?: (value: string) => void;
  onExportAll?: () => void;
  onImportAll?: () => void;
  onDeleteAll?: () => void;
  onHasUnsavedChangesChange?: (hasUnsaved: boolean) => void;
  isImporting?: boolean;
}

const MAX_QUICK_NOTE_LENGTH = 100;

const MusicLyrics: React.FC<MusicLyricsProps> = ({
  quickNotes,
  quickNoteInput,
  onQuickNoteInputChange,
  onAddQuickNote,
  onDeleteQuickNote,
  onUpdateQuickNote,
  searchContent = '',
  onSearchContentChange,
  onExportAll,
  onImportAll,
  onDeleteAll,
  onHasUnsavedChangesChange,
  isImporting: _isImporting = false,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const quickNotesRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // 跟踪每个歌词的删除点击次数和定时器
  const deleteClickCounts = useRef<Map<string, { count: number; timer: NodeJS.Timeout | null }>>(new Map());

  // 动态调整时间轴高度
  useEffect(() => {
    const updateTimelineHeight = () => {
      if (listRef.current) {
        if (quickNotes.length > 0) {
          const items = listRef.current.querySelectorAll('.quick-note-item');
          if (items.length > 0) {
            const lastItem = items[items.length - 1] as HTMLElement;
            const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
            listRef.current.style.setProperty('--timeline-height', `${lastItemBottom}px`);
          }
        } else {
          // 当没有内容时，将竖线高度设置为0，隐藏竖线
          listRef.current.style.setProperty('--timeline-height', '0px');
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
      toast.error('歌词内容不能为空！');
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


  // 检查是否有未保存的修改（使用 useMemo 缓存结果，避免每次输入都重新创建函数）
  const hasUnsavedChanges = useMemo((): boolean => {
    if (!editingNoteId) return false;
    return quickNoteInput.trim() !== originalContent;
  }, [editingNoteId, quickNoteInput, originalContent]);

  // 使用 ref 跟踪上一次的值，避免不必要的回调调用
  const prevHasUnsavedChangesRef = useRef<boolean>(false);

  // 通知父组件未保存状态的变化
  useEffect(() => {
    if (onHasUnsavedChangesChange && hasUnsavedChanges !== prevHasUnsavedChangesRef.current) {
      prevHasUnsavedChangesRef.current = hasUnsavedChanges;
      onHasUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onHasUnsavedChangesChange]);

  // 如果当前正在编辑的歌词被删除，清空编辑面板
  useEffect(() => {
    if (editingNoteId) {
      const noteExists = quickNotes.some(note => note.id === editingNoteId);
      if (!noteExists) {
        // 当前编辑的歌词已被删除，清空编辑面板
        setEditingNoteId(null);
        setOriginalContent('');
        onQuickNoteInputChange('');
      }
    }
  }, [quickNotes, editingNoteId, onQuickNoteInputChange]);

  // 滚动到当前选中的歌词
  useEffect(() => {
    if (editingNoteId) {
      // 延迟滚动，确保DOM已更新（包括列表更新）
      const scrollTimer = setTimeout(() => {
        const itemElement = itemRefs.current.get(editingNoteId);
        if (itemElement && listRef.current) {
          itemElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 150);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [editingNoteId, quickNotes]);

  // 组件卸载时清理所有删除点击定时器
  useEffect(() => {
    const clickCounts = deleteClickCounts.current;
    return () => {
      clickCounts.forEach(({ timer }) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
      clickCounts.clear();
    };
  }, []);

  // 点击歌词进入编辑模式
  const handleNoteClick = useCallback((note: QuickNote) => {
    // 如果点击的是当前正在编辑的歌词，清空面板
    if (editingNoteId === note.id) {
      // 检查是否有未保存的修改
      if (hasUnsavedChanges) {
        const shouldContinue = window.confirm(
          '当前有未保存的歌词，是否继续当前操作？\n\n'
        );
        
        if (!shouldContinue) {
          // 用户选择不继续，保持当前状态
          return;
        }
      }
      // 清空面板（退出编辑模式）
      handleCancelEdit();
      return;
    }
    
    // 如果正在编辑其他歌词，先检查是否有未保存的改动
    if (editingNoteId && editingNoteId !== note.id) {
      if (hasUnsavedChanges) {
        const shouldContinue = window.confirm(
          '当前有未保存的歌词，是否继续当前操作？\n\n'
        );
        
        if (!shouldContinue) {
          // 用户选择不继续，保持当前状态
          return;
        }
      }
    }
    
    // 批量更新状态，减少重新渲染次数
    // 使用 requestAnimationFrame 确保状态更新在同一帧完成
    requestAnimationFrame(() => {
      setEditingNoteId(note.id);
      setOriginalContent(note.content);
      onQuickNoteInputChange(note.content);
    });
  }, [editingNoteId, hasUnsavedChanges, handleCancelEdit, onQuickNoteInputChange]);

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
        // 新建模式：添加新歌词
        // 如果输入框有内容，直接添加（这是新建操作，不是切换）
        if (quickNoteInput.trim()) {
          onAddQuickNote(e);
        }
      }
    } else if (e.key === 'Escape' && editingNoteId) {
      // 按 ESC 取消编辑
      e.preventDefault();
      if (hasUnsavedChanges) {
        const shouldContinue = window.confirm(
          '当前有未保存的歌词，是否继续当前操作？\n\n'
        );
        
        if (shouldContinue) {
          handleCancelEdit();
        }
      } else {
        handleCancelEdit();
      }
    }
  };

  // 导入歌词
  const handleImportAll = () => {
    if (onImportAll) {
      onImportAll();
    }
  };

  // 删除所有歌词
  const handleDeleteAll = () => {
    if (quickNotes.length === 0) {
      toast('没有歌词可以删除', { icon: '⚠️' });
      return;
    }

    const confirmed = window.confirm(
      `确定要删除所有 ${quickNotes.length} 条歌词吗？\n\n此操作无法撤销！建议先导出备份。`
    );

    if (confirmed && onDeleteAll) {
        onDeleteAll();
    }
  };

  // 处理删除按钮点击（需要快速连点三下）
  const handleDeleteClick = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const clickData = deleteClickCounts.current.get(noteId);
    const currentCount = clickData ? clickData.count + 1 : 1;
    
    // 清除之前的定时器
    if (clickData?.timer) {
      clearTimeout(clickData.timer);
    }
    
    // 如果已经点击了三次，执行删除
    if (currentCount >= 3) {
      deleteClickCounts.current.delete(noteId);
      onDeleteQuickNote(noteId);
      return;
    }
    
    // 设置定时器，0.5秒内如果没有继续点击，重置计数
    const timer = setTimeout(() => {
      deleteClickCounts.current.delete(noteId);
    }, 500);
    
    // 更新点击计数
    deleteClickCounts.current.set(noteId, { count: currentCount, timer });
  }, [onDeleteQuickNote]);

  return (
    <div className="quick-notes" ref={quickNotesRef}>
      <div className="quick-notes__header">
        <h3 className="quick-notes__title">💭 歌词 ({quickNotes.length})</h3>
        {onSearchContentChange && (
          <div className="quick-notes__search">
            <FilterSearchInput
              value={searchContent}
              onChange={onSearchContentChange}
              placeholder="搜索文本"
            />
          </div>
        )}
        <div className="quick-notes__actions">
          <button 
            className="action-icon-btn"
            onClick={onExportAll}
            title="导出所有歌词为JSON"
          >
            📤
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleImportAll}
            title="从JSON导入歌词"
          >
            📥
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleDeleteAll}
            title="删除所有歌词"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="quick-notes__input">
        <textarea
          placeholder={
            editingNoteId 
              ? "修改内容后按Ctrl+Enter保存，ESC取消" 
              : "记录你喜爱的歌词（按Ctrl+Enter保存）"
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
        {quickNotes.length === 0 ? (
          <div className="quick-notes__empty">
            <div className="quick-notes__empty-icon">💭</div>
            <p className="quick-notes__empty-message">还没有歌词</p>
            <p className="quick-notes__empty-hint">开始记录你喜爱的歌词吧~</p>
          </div>
        ) : (
          quickNotes.map(note => (
          <div 
            key={note.id}
            ref={(el) => {
              if (el) {
                itemRefs.current.set(note.id, el);
              } else {
                itemRefs.current.delete(note.id);
              }
            }}
            className={`quick-note-item ${editingNoteId === note.id ? 'editing' : ''} ${editingNoteId === note.id && hasUnsavedChanges ? 'unsaved' : ''}`}
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
                onClick={(e) => handleDeleteClick(note.id, e)}
                title="快速连点三下删除（防止误触）"
              >
                🗑️
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default MusicLyrics;
