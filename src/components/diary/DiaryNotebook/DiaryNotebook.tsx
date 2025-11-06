import React, { useRef, useCallback } from 'react';
import { PRESET_THEMES, WEATHER_OPTIONS, MOOD_OPTIONS, FONT_OPTIONS } from '@/utils';
import './DiaryNotebook.scss';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // 处理键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 保存
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
  };

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
                        className="theme-option"
                        style={{ backgroundColor: theme.color }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onThemeChange(theme.color);
                        }}
                        title={theme.name}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                  <div className="custom-theme">
                    <label>自定义颜色</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={customThemeColor}
                        onChange={(e) => onCustomThemeColorChange(e.target.value)}
                      />
                      <button
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
          <textarea
            ref={textareaRef}
            placeholder="记录你的灵感（按Ctrl+Enter保存）"
            value={diaryContent}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="diary-textarea"
            style={{ fontFamily: currentFont }}
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
