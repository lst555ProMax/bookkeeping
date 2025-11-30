import React, { useState, useRef, useCallback, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { PRESET_THEMES, WEATHER_OPTIONS, MOOD_OPTIONS, FONT_OPTIONS } from '@/utils';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import './DiaryNotebook.scss';

export interface DiaryNotebookRef {
  focusEditor: () => void;
  blurEditor: () => void;
}

const TEXT_COLORS = [
  '#1a1a1a', 
  '#FFD400', 
  '#FF6666', 
  '#5FB236', 
  '#2EA8E5', 
  '#A28AE5', 
  '#E56EEE', 
  '#F19837', 
];

const HIGHLIGHT_COLORS = [
  'transparent', // 无高亮
  '#FFB3BA', // 柔和粉红
  '#FFDFBA', // 柔和橙
  '#FFFFBA', // 柔和黄
  '#BAFFC9', // 柔和绿
  '#BAE1FF', // 柔和蓝
  '#E0BBE4', // 柔和紫
  '#D4D4D4', // 柔和灰
];

interface DiaryNotebookProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  currentWeather: string;
  onWeatherChange: (weather: string) => void;
  currentMood: string;
  onMoodChange: (mood: string) => void;
  currentFont: string;
  onFontChange: (font: string) => void;
  diaryContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onNew: () => void;
  showThemePicker: boolean;
  onShowThemePickerChange: (show: boolean) => void;
  showWeatherPicker: boolean;
  onShowWeatherPickerChange: (show: boolean) => void;
  showMoodPicker: boolean;
  onShowMoodPickerChange: (show: boolean) => void;
  showFontPicker: boolean;
  onShowFontPickerChange: (show: boolean) => void;
  customThemeColor: string;
  onCustomThemeColorChange: (color: string) => void;
}

const DiaryNotebook = forwardRef<DiaryNotebookRef, DiaryNotebookProps>(({
  selectedDate,
  onDateChange,
  currentTheme,
  onThemeChange,
  currentWeather,
  onWeatherChange,
  currentMood,
  onMoodChange,
  currentFont,
  onFontChange,
  diaryContent,
  onContentChange,
  onSave,
  onNew,
  showThemePicker,
  onShowThemePickerChange,
  showWeatherPicker,
  onShowWeatherPickerChange,
  showMoodPicker,
  onShowMoodPickerChange,
  showFontPicker,
  onShowFontPickerChange,
  customThemeColor,
  onCustomThemeColorChange,
}, ref) => {
  // 根据背景颜色计算合适的行线颜色
  const getLineColor = useCallback((bgColor: string): string => {
    // 标准化颜色值
    const normalizeColor = (color: string): string => {
      if (!color || !color.startsWith('#')) return color;
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
      }
      return color.toUpperCase();
    };
    
    const normalized = normalizeColor(bgColor);
    
    // 将十六进制颜色转换为RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    
    // 计算亮度（使用相对亮度公式）
    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    try {
      const [r, g, b] = hexToRgb(normalized);
      const luminance = getLuminance(r, g, b);
      
      // 根据亮度调整行线颜色
      if (luminance > 0.75) {
        // 非常浅的背景：使用柔和的深色行线，保持色调一致性
        const factor = 0.8; // 降低亮度
        const lineR = Math.max(0, Math.min(255, Math.round(r * factor)));
        const lineG = Math.max(0, Math.min(255, Math.round(g * factor)));
        const lineB = Math.max(0, Math.min(255, Math.round(b * factor)));
        return `#${lineR.toString(16).padStart(2, '0')}${lineG.toString(16).padStart(2, '0')}${lineB.toString(16).padStart(2, '0')}`;
      } else if (luminance > 0.5) {
        // 中等浅色背景：使用中等深度的行线
        const factor = 0.7;
        const lineR = Math.max(0, Math.min(255, Math.round(r * factor)));
        const lineG = Math.max(0, Math.min(255, Math.round(g * factor)));
        const lineB = Math.max(0, Math.min(255, Math.round(b * factor)));
        return `#${lineR.toString(16).padStart(2, '0')}${lineG.toString(16).padStart(2, '0')}${lineB.toString(16).padStart(2, '0')}`;
      } else if (luminance > 0.25) {
        // 中等深色背景：使用中等亮度的行线
        const factor = 1.3;
        const lineR = Math.max(0, Math.min(255, Math.round(r * factor)));
        const lineG = Math.max(0, Math.min(255, Math.round(g * factor)));
        const lineB = Math.max(0, Math.min(255, Math.round(b * factor)));
        return `#${lineR.toString(16).padStart(2, '0')}${lineG.toString(16).padStart(2, '0')}${lineB.toString(16).padStart(2, '0')}`;
      } else {
        // 深色背景：使用柔和的亮色行线
        const factor = 1.6;
        const lineR = Math.max(0, Math.min(255, Math.round(r * factor)));
        const lineG = Math.max(0, Math.min(255, Math.round(g * factor)));
        const lineB = Math.max(0, Math.min(255, Math.round(b * factor)));
        return `#${lineR.toString(16).padStart(2, '0')}${lineG.toString(16).padStart(2, '0')}${lineB.toString(16).padStart(2, '0')}`;
      }
    } catch {
      // 如果计算失败，返回默认的行线颜色
      return '#e8e4d8';
    }
  }, []);

  // 计算当前背景对应的行线颜色
  const lineColor = useMemo(() => getLineColor(currentTheme), [currentTheme, getLineColor]);

  // 选择更新状态：用于强制BubbleMenu在选择变化时重新渲染
  const [selectionUpdate, setSelectionUpdate] = useState(0);

  // 标准化颜色值用于比较
  const normalizeColorForComparison = useCallback((color: string | undefined): string => {
    if (!color) return '';
    
    // 如果是 RGB 格式 (rgb(255, 0, 0))
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toUpperCase();
      }
    }
    
    // 如果是十六进制格式
    if (color.startsWith('#')) {
      // 处理3位十六进制 (如 #fff)
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
      }
      // 处理6位十六进制
      if (color.length === 7) {
        return color.toUpperCase();
      }
    }
    
    return color.toUpperCase();
  }, []);

  // 使用 useMemo 确保扩展数组只创建一次，避免重复注册
  const extensions = useMemo(() => [
    StarterKit,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    Underline,
    BubbleMenuExtension,
    Placeholder.configure({
      placeholder: '记录你的日常（按Ctrl+Enter保存）',
    }),
  ], []);

  // Tiptap editor setup
  const editor = useEditor({
    extensions,
    content: diaryContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'diary-content-editable',
      },
      handleKeyDown: (_view, event) => {
        // 处理 Ctrl+Enter 保存
        if (event.ctrlKey && event.key === 'Enter') {
          event.preventDefault();
          onSave();
          return true;
        }
        return false;
      },
    },
  });

  // 监听选择变化，强制BubbleMenu更新
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setSelectionUpdate(prev => prev + 1);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // 暴露编辑器焦点方法给父组件
  useImperativeHandle(ref, () => ({
    focusEditor: () => {
      if (editor) {
        editor.commands.focus();
      }
    },
    blurEditor: () => {
      if (editor) {
        editor.view.dom.blur();
      }
    },
  }), [editor]);

  // 将纯文本转换为 HTML（保留换行）
  const convertTextToHTML = (text: string): string => {
    if (!text) return '';
    // 如果已经是 HTML（包含标签），直接返回
    if (/<[^>]+>/.test(text)) {
      return text;
    }
    // 将纯文本转换为 HTML，保留换行
    return text
      .split('\n')
      .map(line => line.trim() === '' ? '<p></p>' : `<p>${line}</p>`)
      .join('');
  };

  // Sync content when diaryContent changes from outside
  useEffect(() => {
    if (editor) {
      const currentHTML = editor.getHTML();
      // 如果内容是纯文本，先转换为 HTML；如果已经是 HTML，保持不变
      const htmlContent = convertTextToHTML(diaryContent);
      
      // 只有当转换后的 HTML 与当前编辑器内容不同时才更新
      if (htmlContent !== currentHTML) {
        editor.commands.setContent(htmlContent);
      }
    }
  }, [diaryContent, editor, selectedDate]); // Added selectedDate to ensure update on date change

  // 更新竖线高度：初始填满视窗，内容增加时跟随内容增长，内容减少但不需要滚动时保持填满视窗
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    
    const updateVerticalLineHeight = () => {
      if (verticalLineRef.current && editor && contentRef.current) {
        const proseMirror = editor.view.dom;
        if (proseMirror && contentRef.current) {
          // 获取内容的实际高度
          const contentHeight = proseMirror.scrollHeight || proseMirror.offsetHeight;
          // 获取滚动容器的可视高度（视窗高度）- 这是关键！
          const containerHeight = contentRef.current.clientHeight;
          
          // 如果容器高度为0或太小，说明还没渲染好，需要重试
          if (containerHeight < 100 && retryCount < maxRetries) {
            retryCount++;
            setTimeout(updateVerticalLineHeight, 50);
            return;
          }
          
          // 竖线高度 = max(内容实际高度, 容器可视高度)
          // 关键逻辑：即使内容很少，竖线也要填满整个容器可视区域
          // 强制确保竖线高度至少等于容器高度
          const lineHeight = Math.max(contentHeight, containerHeight);
          
          if (containerHeight > 0) {
            // 确保竖线高度至少等于容器高度（这是关键！）
            const finalHeight = Math.max(lineHeight, containerHeight);
            verticalLineRef.current.style.height = `${finalHeight}px`;
            verticalLineRef.current.style.minHeight = `${containerHeight}px`;
            retryCount = 0; // 重置重试计数
            
            // 调试信息（可以在控制台查看）
            // console.log('竖线高度更新:', { contentHeight, containerHeight, finalHeight });
          }
        }
      }
    };

    // 使用 requestAnimationFrame 确保在浏览器完成渲染后更新
    const scheduleUpdate = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateVerticalLineHeight();
        });
      });
    };

    // 初始设置 - 多次尝试确保获取到正确的高度
    if (editor) {
      scheduleUpdate();
      // 使用多个延迟作为备用
      setTimeout(updateVerticalLineHeight, 50);
      setTimeout(updateVerticalLineHeight, 100);
      setTimeout(updateVerticalLineHeight, 200);
      setTimeout(updateVerticalLineHeight, 300);
      setTimeout(updateVerticalLineHeight, 500);
    }

    // 监听内容变化
    if (editor) {
      const proseMirror = editor.view.dom;
      
      // 使用 ResizeObserver 监听内容高度变化
      const resizeObserver = new ResizeObserver(() => {
        updateVerticalLineHeight();
      });
      
      if (proseMirror) {
        resizeObserver.observe(proseMirror);
      }
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
      
      // 监听编辑器更新事件
      const handleUpdate = () => {
        setTimeout(updateVerticalLineHeight, 0);
      };
      
      editor.on('update', handleUpdate);
      
      // 监听窗口大小变化和滚动事件（容器大小可能变化）
      window.addEventListener('resize', updateVerticalLineHeight);
      const contentElement = contentRef.current;
      if (contentElement) {
        contentElement.addEventListener('scroll', updateVerticalLineHeight);
      }
      
      return () => {
        resizeObserver.disconnect();
        editor.off('update', handleUpdate);
        window.removeEventListener('resize', updateVerticalLineHeight);
        if (contentElement) {
          contentElement.removeEventListener('scroll', updateVerticalLineHeight);
        }
      };
    }
  }, [editor]);

  // 当内容同步后也更新竖线高度
  useEffect(() => {
    if (editor && verticalLineRef.current && contentRef.current) {
      const updateVerticalLineHeight = () => {
        const proseMirror = editor.view.dom;
        if (proseMirror && contentRef.current && verticalLineRef.current) {
          // 获取内容的实际高度
          const contentHeight = proseMirror.scrollHeight || proseMirror.offsetHeight;
          // 获取滚动容器的可视高度（视窗高度）
          const containerHeight = contentRef.current.clientHeight;
          
          // 竖线高度 = max(内容实际高度, 容器可视高度)
          // 关键逻辑：即使内容很少，竖线也要填满整个容器可视区域
          // 强制确保竖线高度至少等于容器高度
          const lineHeight = Math.max(contentHeight, containerHeight);
          
          if (containerHeight > 0) {
            // 确保竖线高度至少等于容器高度（这是关键！）
            const finalHeight = Math.max(lineHeight, containerHeight);
            verticalLineRef.current.style.height = `${finalHeight}px`;
            verticalLineRef.current.style.minHeight = `${containerHeight}px`;
          }
        }
      };
      
      // 使用 requestAnimationFrame 确保在浏览器完成渲染后更新
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateVerticalLineHeight();
        });
      });
      
      // 也使用多个延迟作为备用
      setTimeout(updateVerticalLineHeight, 50);
      setTimeout(updateVerticalLineHeight, 100);
      setTimeout(updateVerticalLineHeight, 200);
      setTimeout(updateVerticalLineHeight, 300);
    }
  }, [diaryContent, editor, selectedDate]);

  // 延迟关闭的定时器引用
  const themeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const weatherTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fontTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 竖线元素引用
  const verticalLineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 处理鼠标离开事件，添加延迟
  const handleMouseLeave = useCallback((
    timerRef: React.MutableRefObject<NodeJS.Timeout | null>,
    onClose: (show: boolean) => void
  ) => {
    timerRef.current = setTimeout(() => {
      onClose(false);
    }, 350); // 350ms 延迟
  }, []);

  // 处理鼠标进入事件，清除延迟
  const handleMouseEnter = useCallback((
    timerRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  return (
    <div className="diary-notebook">
      <div className="notebook__spine"></div>
      <div className="notebook__page" style={{ backgroundColor: currentTheme }}>
        <div className="notebook__header">
          <div className="notebook__header-left">
            <div className="date-display">
              <DatePicker
                value={selectedDate}
                onChange={onDateChange}
                minDate="2024-01-01"
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* 主题颜色选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                handleMouseEnter(themeTimerRef);
                onShowThemePickerChange(true);
                onShowWeatherPickerChange(false);
                onShowMoodPickerChange(false);
                onShowFontPickerChange(false);
              }}
              onMouseLeave={() => handleMouseLeave(themeTimerRef, onShowThemePickerChange)}
            >
              <button 
                className="action-icon-btn" 
                title="主题颜色"
              >
                🎨
              </button>
              {showThemePicker && (
                <div className="dropdown-menu theme-picker">
                  <div className="theme-presets">
                    {PRESET_THEMES.map(theme => (
                      <button
                        key={theme.name}
                        className="theme-option theme-option--circle"
                        style={{ backgroundColor: theme.color }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onThemeChange(theme.color);
                        }}
                        title={theme.name}
                      />
                    ))}
                  </div>
                  <div className="custom-theme">
                    <div className="custom-theme-header">
                      <div className="color-input-wrapper">
                        <div className="color-picker-wrapper">
                          <input
                            type="color"
                            className="color-picker-input color-picker-input--circle"
                            value={customThemeColor}
                            onChange={(e) => onCustomThemeColorChange(e.target.value)}
                          />
                          <div className="color-picker-preview" />
                        </div>
                        <button
                          className="custom-color-btn"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onThemeChange(customThemeColor);
                          }}
                        >
                          应用自定义颜色
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 字体选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                handleMouseEnter(fontTimerRef);
                onShowFontPickerChange(true);
                onShowThemePickerChange(false);
                onShowWeatherPickerChange(false);
                onShowMoodPickerChange(false);
              }}
              onMouseLeave={() => handleMouseLeave(fontTimerRef, onShowFontPickerChange)}
            >
              <button 
                className="action-icon-btn" 
                title="字体"
              >
                🖋️
              </button>
              {showFontPicker && (
                <div className="dropdown-menu font-picker">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.label}
                      className="font-option"
                      style={{ fontFamily: font.value }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onFontChange(font.value);
                      }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 天气选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                handleMouseEnter(weatherTimerRef);
                onShowWeatherPickerChange(true);
                onShowThemePickerChange(false);
                onShowMoodPickerChange(false);
                onShowFontPickerChange(false);
              }}
              onMouseLeave={() => handleMouseLeave(weatherTimerRef, onShowWeatherPickerChange)}
            >
              <button 
                className="action-icon-btn" 
                title="天气"
              >
                {currentWeather ? WEATHER_OPTIONS.find(w => w.label === currentWeather)?.icon || '🌤️' : '🌤️'}
              </button>
              {showWeatherPicker && (
                <div className="dropdown-menu weather-picker">
                  {WEATHER_OPTIONS.map(weather => (
                    <button
                      key={weather.label}
                      className="picker-option"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onWeatherChange(weather.label);
                      }}
                    >
                      <span className="option-icon">{weather.icon}</span>
                      <span className="option-label">{weather.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 心情选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                handleMouseEnter(moodTimerRef);
                onShowMoodPickerChange(true);
                onShowThemePickerChange(false);
                onShowWeatherPickerChange(false);
                onShowFontPickerChange(false);
              }}
              onMouseLeave={() => handleMouseLeave(moodTimerRef, onShowMoodPickerChange)}
            >
              <button 
                className="action-icon-btn" 
                title="心情"
              >
                {currentMood ? MOOD_OPTIONS.find(m => m.label === currentMood)?.icon || '😊' : '😊'}
              </button>
              {showMoodPicker && (
                <div className="dropdown-menu mood-picker">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      key={mood.label}
                      className="picker-option"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onMoodChange(mood.label);
                      }}
                    >
                      <span className="option-icon">{mood.icon}</span>
                      <span className="option-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="notebook__actions">
            <button className="action-icon-btn" onClick={onNew} title="新建日记">
              ➕
            </button>
            <button className="action-icon-btn" onClick={onSave} title="保存">
              💾
            </button>
          </div>
        </div>
        
        <div className="notebook__content" ref={contentRef}>
          {editor && (
            <BubbleMenu className="bubble-menu" editor={editor}>
              {/* 第一行：格式按钮 */}
              <div className="bubble-menu__row" key={`format-${selectionUpdate}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editor.chain().focus().toggleBold().run();
                  }}
                  className={`format-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                >
                  <span className="format-icon format-icon--bold">B</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editor.chain().focus().toggleStrike().run();
                  }}
                  className={`format-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                >
                  <span className="format-icon format-icon--strike">S</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editor.chain().focus().toggleItalic().run();
                  }}
                  className={`format-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                >
                  <span className="format-icon format-icon--italic">I</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editor.chain().focus().toggleUnderline().run();
                  }}
                  className={`format-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
                >
                  <span className="format-icon format-icon--underline">U</span>
                </button>
              </div>
              
              {/* 第二行：文字颜色 */}
              <div className="bubble-menu__row" key={`text-color-${selectionUpdate}`}>
                {TEXT_COLORS.map((color) => {
                  const textStyleAttrs = editor.getAttributes('textStyle');
                  const currentColor = textStyleAttrs.color;
                  // 标准化颜色值进行比较
                  const normalizedCurrentColor = normalizeColorForComparison(currentColor);
                  const normalizedColor = normalizeColorForComparison(color);
                  const isActive = normalizedCurrentColor === normalizedColor || (color === '#1a1a1a' && !currentColor);
                  
                  return (
                    <button
                      key={color}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setColor(color).run();
                        // 设置颜色后立即更新选择状态
                        setTimeout(() => setSelectionUpdate(prev => prev + 1), 0);
                      }}
                      className={`color-btn color-btn--text ${isActive ? 'is-active' : ''}`}
                      title={color}
                    >
                      <span style={{ color }}>A</span>
                    </button>
                  );
                })}
              </div>
              
              {/* 第三行：高亮颜色 */}
              <div className="bubble-menu__row" key={`highlight-${selectionUpdate}`}>
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (color === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().setHighlight({ color }).run();
                      }
                    }}
                    className={`color-btn color-btn--highlight ${
                      color === 'transparent' 
                        ? !editor.isActive('highlight') ? 'is-active' : ''
                        : editor.isActive('highlight', { color }) ? 'is-active' : ''
                    }`}
                    title={color === 'transparent' ? '无高亮' : color}
                  >
                    <span className="highlight-preview" style={{ backgroundColor: color }}></span>
                  </button>
                ))}
              </div>
            </BubbleMenu>
          )}
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            {/* 竖线元素 - 放在编辑器内容内部，跟随内容滚动 */}
            <div 
              ref={verticalLineRef}
              className="notebook__content-line"
              style={{ 
                '--vertical-line-color': lineColor
              } as React.CSSProperties & { '--vertical-line-color': string }}
            />
            <EditorContent 
              editor={editor}
              style={{ 
                fontFamily: currentFont, 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100%',
                '--line-color': lineColor
              } as React.CSSProperties & { '--line-color': string }}
            />
          </div>
        </div>

        <div className="notebook__lines">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="line"></div>
          ))}
        </div>
      </div>
    </div>
  );
});

DiaryNotebook.displayName = 'DiaryNotebook';

export default DiaryNotebook;
