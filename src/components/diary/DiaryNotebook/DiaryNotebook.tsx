import React, { useRef } from 'react';
import { PRESET_THEMES, WEATHER_OPTIONS, MOOD_OPTIONS } from '../types';
import './DiaryNotebook.scss';

interface DiaryNotebookProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  currentWeather: string;
  onWeatherChange: (weather: string) => void;
  currentMood: string;
  onMoodChange: (mood: string) => void;
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
  customThemeColor: string;
  onCustomThemeColorChange: (color: string) => void;
}

const DiaryNotebook: React.FC<DiaryNotebookProps> = ({
  selectedDate,
  onDateChange,
  currentTheme,
  onThemeChange,
  currentWeather,
  onWeatherChange,
  currentMood,
  onMoodChange,
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
  customThemeColor,
  onCustomThemeColorChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="diary-notebook">
      <div className="notebook__spine"></div>
      <div className="notebook__page" style={{ backgroundColor: currentTheme }}>
        <div className="notebook__header">
          <div className="notebook__header-left">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="date-input"
            />
            
            {/* 主题颜色选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                onShowThemePickerChange(true);
                onShowWeatherPickerChange(false);
                onShowMoodPickerChange(false);
              }}
              onMouseLeave={() => onShowThemePickerChange(false)}
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

            {/* 天气选择器 */}
            <div 
              className="action-dropdown"
              onMouseEnter={() => {
                onShowWeatherPickerChange(true);
                onShowThemePickerChange(false);
                onShowMoodPickerChange(false);
              }}
              onMouseLeave={() => onShowWeatherPickerChange(false)}
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
                onShowMoodPickerChange(true);
                onShowThemePickerChange(false);
                onShowWeatherPickerChange(false);
              }}
              onMouseLeave={() => onShowMoodPickerChange(false)}
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
            <button className="action-icon-btn" onClick={onNew} title="新建">
              📄
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
            className="diary-textarea"
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
