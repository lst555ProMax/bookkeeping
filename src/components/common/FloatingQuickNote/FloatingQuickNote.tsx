import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './FloatingQuickNote.scss';

interface FloatingQuickNoteProps {
  onAddQuickNote: (content: string) => void;
}

const MAX_QUICK_NOTE_LENGTH = 100;

type FloatingMode = 'quickNote' | 'lyrics' | 'excerpt' | 'todo';

const FloatingQuickNote: React.FC<FloatingQuickNoteProps> = ({ onAddQuickNote }) => {
  // 从 localStorage 加载初始状态
  const loadInitialState = () => {
    const savedMode = localStorage.getItem('floatingMode') as FloatingMode | null;
    const savedLastNonTodoMode = localStorage.getItem('floatingLastNonTodoMode') as FloatingMode | null;
    const savedIsOpen = localStorage.getItem('floatingWindowOpen');
    const savedWindowPos = localStorage.getItem('floatingWindowPosition');
    const savedButtonPos = localStorage.getItem('floatingButtonPosition');
    const savedQuickNote = localStorage.getItem('floatingQuickNoteTemp');
    const savedLyrics = localStorage.getItem('floatingLyricsTemp');
    const savedExcerpt = localStorage.getItem('floatingExcerptTemp');
    const savedTodo = localStorage.getItem('floatingTodo');

    return {
      mode: savedMode || 'quickNote',
      lastNonTodoMode: savedLastNonTodoMode || 'quickNote',
      isWindowOpen: savedIsOpen === 'true',
      windowPosition: savedWindowPos ? JSON.parse(savedWindowPos) : { x: 100, y: 100 },
      buttonPosition: savedButtonPos ? JSON.parse(savedButtonPos) : { x: 40, y: 40 },
      quickNoteInput: savedQuickNote || '',
      lyricsInput: savedLyrics || '',
      excerptInput: savedExcerpt || '',
      todoInput: savedTodo || '',
    };
  };

  const initialState = loadInitialState();

  const [mode, setMode] = useState<FloatingMode>(initialState.mode); // 当前模式
  const [lastNonTodoMode, setLastNonTodoMode] = useState<FloatingMode>(initialState.lastNonTodoMode); // 上一次的非待办模式
  const [isWindowOpen, setIsWindowOpen] = useState(initialState.isWindowOpen);
  const [quickNoteInput, setQuickNoteInput] = useState(initialState.quickNoteInput);
  const [lyricsInput, setLyricsInput] = useState(initialState.lyricsInput); // 歌词输入内容
  const [excerptInput, setExcerptInput] = useState(initialState.excerptInput); // 摘抄输入内容
  const [todoInput, setTodoInput] = useState(initialState.todoInput); // 待办输入内容
  const [buttonPosition, setButtonPosition] = useState(initialState.buttonPosition); // 悬浮球距离右下角的距离
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
    // 如果不是待办模式，保存为lastNonTodoMode
    if (mode !== 'todo') {
      setLastNonTodoMode(mode);
      localStorage.setItem('floatingLastNonTodoMode', mode);
    }
  }, [mode]);

  // 保存窗口状态到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingWindowOpen', String(isWindowOpen));
  }, [isWindowOpen]);

  // 保存窗口位置到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingWindowPosition', JSON.stringify(windowPosition));
  }, [windowPosition]);

  // 保存悬浮球位置到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingButtonPosition', JSON.stringify(buttonPosition));
  }, [buttonPosition]);

  // 自动保存速记内容(临时,不保存到列表)
  useEffect(() => {
    localStorage.setItem('floatingQuickNoteTemp', quickNoteInput);
  }, [quickNoteInput]);

  // 自动保存歌词内容到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingLyricsTemp', lyricsInput);
  }, [lyricsInput]);

  // 自动保存摘抄内容到 localStorage
  useEffect(() => {
    localStorage.setItem('floatingExcerptTemp', excerptInput);
  }, [excerptInput]);

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

  // 处理右键点击切换模式（记录模式 ↔ 待办）
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 右键在记录模式和待办之间切换，切回时恢复到上一次的记录模式
    const newMode = mode === 'todo' ? lastNonTodoMode : 'todo';
    setMode(newMode);
    
    // 如果悬浮窗关闭,不打开;如果已打开,保持打开状态(这样可以看到切换后的内容)
    return false;
  };

  // 处理模式切换按钮点击（速记 → 歌词 → 摘抄 → 速记）
  const handleModeSwitch = () => {
    // 循环切换：速记 → 歌词 → 摘抄 → 速记
    const modeOrder: FloatingMode[] = ['quickNote', 'lyrics', 'excerpt'];
    const currentIndex = modeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    setMode(modeOrder[nextIndex]);
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
    if (mode === 'quickNote' || mode === 'lyrics' || mode === 'excerpt') {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation(); // 阻止事件冒泡，避免全局生效
        if (mode === 'quickNote') {
          handleAddQuickNote();
        } else if (mode === 'lyrics') {
          handleAddLyrics();
        } else if (mode === 'excerpt') {
          handleAddExcerpt();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseWindow();
      }
    } else {
      // 待办模式只处理ESC关闭
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
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

  // 添加歌词
  const handleAddLyrics = () => {
    const trimmedContent = lyricsInput.trim();
    
    if (!trimmedContent) {
      toast.error('歌词内容不能为空！');
      return;
    }

    if (trimmedContent.length > MAX_QUICK_NOTE_LENGTH) {
      toast.error(`歌词内容不能超过 ${MAX_QUICK_NOTE_LENGTH} 个字符！`);
      return;
    }

    // 导入并调用 music utils 的 addQuickNote
    import('@/utils/music').then(({ addQuickNote }) => {
      addQuickNote(trimmedContent);
      // 触发全局事件通知音乐页面更新
      window.dispatchEvent(new Event('quickNoteAdded'));
      toast.success('歌词添加成功！');
      
      // 清空歌词内容
      setLyricsInput('');
      localStorage.setItem('floatingLyricsTemp', '');
    }).catch((error) => {
      console.error('添加歌词失败:', error);
      toast.error('添加歌词失败！');
    });
  };

  // 添加摘抄
  const handleAddExcerpt = () => {
    const trimmedContent = excerptInput.trim();
    
    if (!trimmedContent) {
      toast.error('摘抄内容不能为空！');
      return;
    }

    if (trimmedContent.length > MAX_QUICK_NOTE_LENGTH) {
      toast.error(`摘抄内容不能超过 ${MAX_QUICK_NOTE_LENGTH} 个字符！`);
      return;
    }

    // 导入并调用 reading utils 的 addQuickNote
    import('@/utils/reading').then(({ addQuickNote }) => {
      addQuickNote(trimmedContent);
      // 触发全局事件通知阅读页面更新
      window.dispatchEvent(new Event('quickNoteAdded'));
      toast.success('摘抄添加成功！');
      
      // 清空摘抄内容
      setExcerptInput('');
      localStorage.setItem('floatingExcerptTemp', '');
    }).catch((error) => {
      console.error('添加摘抄失败:', error);
      toast.error('添加摘抄失败！');
    });
  };

  // 获取剩余字符数
  const getRemainingChars = () => {
    if (mode === 'quickNote') {
      return MAX_QUICK_NOTE_LENGTH - quickNoteInput.length;
    } else if (mode === 'lyrics') {
      return MAX_QUICK_NOTE_LENGTH - lyricsInput.length;
    } else if (mode === 'excerpt') {
      return MAX_QUICK_NOTE_LENGTH - excerptInput.length;
    }
    return 0; // 待办模式不限制字符数
  };

  // 获取当前模式的图标
  const getModeIcon = () => {
    // 记录模式统一使用速记logo，待办模式使用独立logo
    if (mode === 'todo') return '📝';
    return '💭';
  };

  // 获取当前模式的标题
  const getModeTitle = () => {
    if (mode === 'quickNote') return '速记';
    if (mode === 'lyrics') return '歌词';
    if (mode === 'excerpt') return '摘抄';
    return '待办';
  };

  // 获取当前输入内容
  const getCurrentInput = () => {
    if (mode === 'quickNote') return quickNoteInput;
    if (mode === 'lyrics') return lyricsInput;
    if (mode === 'excerpt') return excerptInput;
    return todoInput;
  };

  // 设置当前输入内容
  const setCurrentInput = (value: string) => {
    if (mode === 'quickNote') setQuickNoteInput(value);
    else if (mode === 'lyrics') setLyricsInput(value);
    else if (mode === 'excerpt') setExcerptInput(value);
    else setTodoInput(value);
  };

  return (
    <>
      {/* 悬浮球 */}
      <div 
        className={`floating-quick-note-button ${isButtonDragging ? 'dragging' : ''} ${mode === 'todo' ? 'todo-mode' : ''}`}
        style={{ bottom: `${buttonPosition.y}px`, right: `${buttonPosition.x}px` }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleButtonMouseDown}
        title={`${getModeTitle()}（右键切换速记/待办）`}
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
            <div className="header-title">
              <h3>{getModeIcon()} {getModeTitle()}</h3>
              <button 
                className="mode-switch-btn" 
                onClick={handleModeSwitch}
                title="切换模式（速记/歌词/摘抄）"
              >
                🔄
              </button>
            </div>
            <button className="close-btn" onClick={handleCloseWindow}>✕</button>
          </div>
          <div className="window-body">
            {mode === 'quickNote' || mode === 'lyrics' || mode === 'excerpt' ? (
              <>
                <textarea
                  ref={textareaRef}
                  placeholder={
                    mode === 'quickNote' 
                      ? "记录你的灵感（自动保存）&#10;按 Ctrl+Enter 新增到日记-速记列表"
                      : mode === 'lyrics'
                      ? "记录喜爱的歌词（自动保存）&#10;按 Ctrl+Enter 新增到乐记-歌词列表"
                      : "摘抄喜欢的文字（自动保存）&#10;按 Ctrl+Enter 新增到书记-摘抄列表"
                  }
                  value={getCurrentInput()}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={MAX_QUICK_NOTE_LENGTH}
                />
                <div className="char-count">
                  <span className={getRemainingChars() < 20 ? 'warning' : ''}>
                    {getCurrentInput().length}/{MAX_QUICK_NOTE_LENGTH}
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
