import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './FloatingQuickNote.scss';

interface FloatingQuickNoteProps {
  onAddQuickNote: (content: string) => void;
}

const MAX_QUICK_NOTE_LENGTH = 100;

type FloatingMode = 'quickNote' | 'todo';

const FloatingQuickNote: React.FC<FloatingQuickNoteProps> = ({ onAddQuickNote }) => {
  // 从 localStorage 加载初始状态
  const loadInitialState = () => {
    const savedMode = localStorage.getItem('floatingMode') as FloatingMode | null;
    const savedIsOpen = localStorage.getItem('floatingWindowOpen');
    const savedWindowPos = localStorage.getItem('floatingWindowPosition');
    const savedQuickNote = localStorage.getItem('floatingQuickNoteTemp');
    const savedTodo = localStorage.getItem('floatingTodo');

    return {
      mode: savedMode || 'quickNote',
      isWindowOpen: savedIsOpen === 'true',
      windowPosition: savedWindowPos ? JSON.parse(savedWindowPos) : { x: 100, y: 100 },
      quickNoteInput: savedQuickNote || '',
      todoInput: savedTodo || '',
    };
  };

  const initialState = loadInitialState();

  const [mode, setMode] = useState<FloatingMode>(initialState.mode); // 当前模式
  const [isWindowOpen, setIsWindowOpen] = useState(initialState.isWindowOpen);
  const [quickNoteInput, setQuickNoteInput] = useState(initialState.quickNoteInput);
  const [todoInput, setTodoInput] = useState(initialState.todoInput); // 待办输入内容
  const [buttonPosition, setButtonPosition] = useState({ x: 40, y: 40 }); // 悬浮球距离右下角的距离
  const [windowPosition, setWindowPosition] = useState(initialState.windowPosition); // 悬浮窗位置(距离左上角)
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const buttonDragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    initialX: 0, 
    initialY: 0,
    hasMoved: false  // 标记是否真正发生了拖动
  });
  const windowDragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 保存模式到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingMode', mode);
  }, [mode]);

  // 保存窗口状态到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingWindowOpen', String(isWindowOpen));
  }, [isWindowOpen]);

  // 保存窗口位置到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingWindowPosition', JSON.stringify(windowPosition));
  }, [windowPosition]);

  // 自动保存速记内容(临时,不保存到列表)
  useEffect(() => {
    localStorage.setItem('floatingQuickNoteTemp', quickNoteInput);
  }, [quickNoteInput]);

  // 自动保存待办内容到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingTodo', todoInput);
  }, [todoInput]);

  // 当悬浮窗打开或模式切换时,将光标定位到文本末尾
  useEffect(() => {
    if (isWindowOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      // 使用 setTimeout 确保在渲染完成后执行
      setTimeout(() => {
        textarea.focus();
        // 将光标移到文本末尾
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }, 0);
    }
  }, [isWindowOpen, mode]); // 添加 mode 依赖,切换模式时也重新定位光标

  // 处理右键点击切换模式
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 切换模式
    const newMode = mode === 'quickNote' ? 'todo' : 'quickNote';
    setMode(newMode);
    
    // 如果悬浮窗关闭,不打开;如果已打开,保持打开状态(这样可以看到切换后的内容)
    return false;
  };

  // ========== 悬浮球拖动相关 ==========
  // 处理悬浮球拖动开始
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    // 只处理左键点击(button === 0),忽略右键(button === 2)
    if (e.button !== 0) return;
    
    buttonDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: buttonPosition.x,
      initialY: buttonPosition.y,
      hasMoved: false,
    };
    setIsButtonDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理悬浮球拖动
  const handleButtonMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isButtonDragging) return;

    const deltaX = buttonDragRef.current.startX - e.clientX;
    const deltaY = buttonDragRef.current.startY - e.clientY;
    
    // 判断是否移动了足够的距离（超过5px才算拖动）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 5) {
      buttonDragRef.current.hasMoved = true;
    }

    if (buttonDragRef.current.hasMoved) {
      const buttonWidth = 48;
      const buttonHeight = 48;
      const maxX = window.innerWidth - buttonWidth;
      const maxY = window.innerHeight - buttonHeight;
      
      setButtonPosition({
        x: Math.max(0, Math.min(maxX, buttonDragRef.current.initialX + deltaX)),
        y: Math.max(0, Math.min(maxY, buttonDragRef.current.initialY + deltaY)),
      });
    }
  }, [isButtonDragging]);

  // 处理悬浮球拖动结束
  const handleButtonMouseUp = React.useCallback(() => {
    if (isButtonDragging) {
      setIsButtonDragging(false);
      
      // 如果没有真正拖动,才处理点击事件
      if (!buttonDragRef.current.hasMoved) {
        if (isWindowOpen) {
          // 悬浮窗已打开 → 关闭悬浮窗
          setIsWindowOpen(false);
        } else {
          // 悬浮窗关闭 → 打开悬浮窗
          setIsWindowOpen(true);
        }
      }
    }
  }, [isButtonDragging, isWindowOpen]);

  // ========== 悬浮窗拖动相关 ==========
  // 处理悬浮窗拖动开始
  const handleWindowMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    windowDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: windowPosition.x,
      initialY: windowPosition.y,
    };
    setIsWindowDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理悬浮窗拖动
  const handleWindowMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isWindowDragging) return;

    const deltaX = e.clientX - windowDragRef.current.startX;
    const deltaY = e.clientY - windowDragRef.current.startY;

    const windowWidth = 500; // 悬浮窗宽度
    const windowHeight = 300; // 估算的悬浮窗高度（可以根据实际情况调整）
    const maxX = window.innerWidth - windowWidth;
    const maxY = window.innerHeight - windowHeight;

    setWindowPosition({
      x: Math.max(0, Math.min(maxX, windowDragRef.current.initialX + deltaX)),
      y: Math.max(0, Math.min(maxY, windowDragRef.current.initialY + deltaY)),
    });
  }, [isWindowDragging]);

  // 处理悬浮窗拖动结束
  const handleWindowMouseUp = React.useCallback(() => {
    if (isWindowDragging) {
      setIsWindowDragging(false);
    }
  }, [isWindowDragging]);

  // 添加全局监听 - 悬浮球拖动
  React.useEffect(() => {
    if (isButtonDragging) {
      document.addEventListener('mousemove', handleButtonMouseMove);
      document.addEventListener('mouseup', handleButtonMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleButtonMouseMove);
        document.removeEventListener('mouseup', handleButtonMouseUp);
      };
    }
  }, [isButtonDragging, handleButtonMouseMove, handleButtonMouseUp]);

  // 添加全局监听 - 悬浮窗拖动
  React.useEffect(() => {
    if (isWindowDragging) {
      document.addEventListener('mousemove', handleWindowMouseMove);
      document.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleWindowMouseMove);
        document.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [isWindowDragging, handleWindowMouseMove, handleWindowMouseUp]);

  // 关闭悬浮窗
  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    // 不清空任何内容,保持自动保存的状态
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mode === 'quickNote') {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleAddQuickNote();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseWindow();
      }
    } else {
      // 待办模式只处理ESC关闭
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseWindow();
      }
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

    // 保存到速记列表
    onAddQuickNote(trimmedContent);
    toast.success('速记添加成功！');
    
    // 清空速记内容
    setQuickNoteInput('');
    localStorage.setItem('floatingQuickNoteTemp', '');
  };

  // 获取剩余字符数
  const getRemainingChars = () => {
    if (mode === 'quickNote') {
      return MAX_QUICK_NOTE_LENGTH - quickNoteInput.length;
    }
    return 0; // 待办模式不限制字符数
  };

  // 获取当前模式的图标
  const getModeIcon = () => {
    return mode === 'quickNote' ? '💭' : '📝';
  };

  // 获取当前模式的标题
  const getModeTitle = () => {
    return mode === 'quickNote' ? '速记' : '待办';
  };

  return (
    <>
      {/* 悬浮球 */}
      <div 
        className={`floating-quick-note-button ${isButtonDragging ? 'dragging' : ''} ${mode === 'todo' ? 'todo-mode' : ''}`}
        style={{ bottom: `${buttonPosition.y}px`, right: `${buttonPosition.x}px` }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleButtonMouseDown}
        title={`${getModeTitle()}（右键切换模式）`}
      >
        <span className="floating-icon">{getModeIcon()}</span>
      </div>

      {/* 悬浮窗 */}
      {isWindowOpen && (
        <div 
          className="floating-quick-note-window"
          style={{ top: `${windowPosition.y}px`, left: `${windowPosition.x}px` }}
        >
          <div 
            className={`window-header ${isWindowDragging ? 'dragging' : ''}`}
            onMouseDown={handleWindowMouseDown}
          >
            <h3>{getModeIcon()} {getModeTitle()}</h3>
            <button className="close-btn" onClick={handleCloseWindow}>✕</button>
          </div>
          <div className="window-body">
            {mode === 'quickNote' ? (
              <>
                <textarea
                  ref={textareaRef}
                  placeholder="记录你的灵感（自动保存）&#10;按 Ctrl+Enter 保存到速记列表"
                  value={quickNoteInput}
                  onChange={(e) => setQuickNoteInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={MAX_QUICK_NOTE_LENGTH}
                />
                <div className="char-count">
                  <span className={getRemainingChars() < 20 ? 'warning' : ''}>
                    {quickNoteInput.length}/{MAX_QUICK_NOTE_LENGTH}
                  </span>
                  <span className="save-hint">Ctrl+Enter 保存</span>
                </div>
              </>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  placeholder="记录你的待办事项（自动保存）"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="todo-textarea"
                />
                <div className="auto-save-hint">
                  <span>✓ 自动保存</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingQuickNote;
