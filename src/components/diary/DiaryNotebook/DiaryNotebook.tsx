import React, { useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { PRESET_THEMES, WEATHER_OPTIONS, MOOD_OPTIONS, FONT_OPTIONS } from '@/utils';
import './DiaryNotebook.scss';

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

const DiaryNotebook: React.FC<DiaryNotebookProps> = ({
  selectedDate,
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
}) => {
  // Tiptap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      BubbleMenuExtension,
      Placeholder.configure({
        placeholder: '记录你的灵感（按Ctrl+Enter保存）',
      }),
    ],
    content: diaryContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'diary-content-editable',
      },
    },
  });

  // Sync content when diaryContent changes from outside
  useEffect(() => {
    if (editor && diaryContent !== editor.getHTML()) {
      // Only update if the content is different to avoid cursor jumping
      // However, getHTML() might return slightly different HTML than what was passed in
      // A simple check might not be enough, but for now let's try this.
      // Better approach: compare text content or use a more robust comparison if needed.
      // For switching dates, the content will be very different.
      editor.commands.setContent(diaryContent);
    }
  }, [diaryContent, editor, selectedDate]); // Added selectedDate to ensure update on date change

  // 延迟关闭的定时器引用
  const themeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const weatherTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fontTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };
  
  // 处理键盘快捷键 - Tiptap handles most keys, but we might want Ctrl+Enter for save
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        onSave();
      }
    };

    // We can add this listener to the editor's DOM element
    const dom = editor.view.dom;
    dom.addEventListener('keydown', handleKeyDown);
    return () => {
      dom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, onSave]);


  return (
    <div className="diary-notebook">
      <div className="notebook__spine"></div>
      <div className="notebook__page" style={{ backgroundColor: currentTheme }}>
        <div className="notebook__header">
          <div className="notebook__header-left">
            <div className="date-display">
              📅 {formatDate(selectedDate)}
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
        
        <div className="notebook__content">
          {editor && (
            <BubbleMenu className="bubble-menu" editor={editor}>
              <div className="bubble-menu__section">
                <div className="section-label">字体颜色</div>
                <div className="color-options">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setTimeout(() => {
                          const selection = editor.state.selection;
                          editor.commands.setTextSelection(selection.to);
                        }, 0);
                      }}
                      className={`color-btn color-btn--text ${editor.isActive('textStyle', { color }) ? 'is-active' : ''}`}
                      title={color}
                    >
                      <span style={{ color }}>A</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bubble-menu__divider"></div>
              
              <div className="bubble-menu__section">
                <div className="section-label">背景颜色</div>
                <div className="color-options">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        if (color === 'transparent') {
                          editor.chain().focus().unsetHighlight().run();
                        } else {
                          editor.chain().focus().setHighlight({ color }).run();
                        }
                        setTimeout(() => {
                          const selection = editor.state.selection;
                          editor.commands.setTextSelection(selection.to);
                        }, 0);
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
              </div>
            </BubbleMenu>
          )}
          <EditorContent 
            editor={editor} 
            style={{ fontFamily: currentFont, height: '100%' }}
          />
        </div>

        <div className="notebook__lines">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="line"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiaryNotebook;
