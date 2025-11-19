import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import './FloatingQuickNote.scss';

interface FloatingQuickNoteProps {
  onAddQuickNote: (content: string) => void;
}

const MAX_QUICK_NOTE_LENGTH = 100;

const FloatingQuickNote: React.FC<FloatingQuickNoteProps> = ({ onAddQuickNote }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [position, setPosition] = useState({ x: 40, y: 40 }); // 距离右下角的距离
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    initialX: 0, 
    initialY: 0,
    hasMoved: false  // 标记是否真正发生了拖动
  });

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isModalOpen) return; // 模态框打开时不允许拖动
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理拖动
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = dragRef.current.startX - e.clientX;
    const deltaY = dragRef.current.startY - e.clientY;
    
    // 判断是否移动了足够的距离（超过5px才算拖动）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 5) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      setPosition({
        x: Math.max(20, dragRef.current.initialX + deltaX),
        y: Math.max(20, dragRef.current.initialY + deltaY),
      });
    }
  }, [isDragging]);

  // 处理拖动结束
  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // 如果没有真正拖动，触发点击事件
      if (!dragRef.current.hasMoved) {
        setIsModalOpen(true);
        setQuickNoteInput('');
      }
    }
  }, [isDragging]);

  // 添加全局监听
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuickNoteInput('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddQuickNote();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseModal();
    }
  };

  // 添加速记
  const handleAddQuickNote = () => {
    const trimmedContent = quickNoteInput.trim();
    
    if (!trimmedContent) {
      toast.error('速记内容不能为空！');
      return;
    }

    if (trimmedContent.length > MAX_QUICK_NOTE_LENGTH) {
      toast.error(`速记内容不能超过 ${MAX_QUICK_NOTE_LENGTH} 个字符！`);
      return;
    }

    onAddQuickNote(trimmedContent);
    toast.success('速记添加成功！');
    handleCloseModal();
  };

  // 获取剩余字符数
  const getRemainingChars = () => {
    return MAX_QUICK_NOTE_LENGTH - quickNoteInput.length;
  };

  return (
    <>
      {/* 悬浮球 */}
      <div 
        className={`floating-quick-note-button ${isDragging ? 'dragging' : ''}`}
        style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
        onMouseDown={handleMouseDown}
        title="快速速记"
      >
        <span className="floating-icon">💭</span>
      </div>

      {/* 模态框 */}
      {isModalOpen && (
        <div className="floating-quick-note-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💭 速记</h3>
              <button className="close-btn" onClick={handleCloseModal}>✕</button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="记录你的灵感（按Ctrl+Enter保存）"
                value={quickNoteInput}
                onChange={(e) => setQuickNoteInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_QUICK_NOTE_LENGTH}
                autoFocus
              />
              <div className="char-count">
                <span className={getRemainingChars() < 20 ? 'warning' : ''}>
                  {quickNoteInput.length}/{MAX_QUICK_NOTE_LENGTH}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingQuickNote;
