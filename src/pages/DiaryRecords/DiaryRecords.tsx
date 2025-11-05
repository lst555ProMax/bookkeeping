import React, { useState, useRef, useEffect } from 'react';
import './DiaryRecords.scss';

interface QuickNote {
  id: string;
  content: string;
  timestamp: string;
}

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  weather?: string;
  theme?: string; // 主题颜色
}

// 预设主题颜色
const PRESET_THEMES = [
  { name: '默认', color: '#fffef9' },
  { name: '温馨', color: '#fff5e1' },
  { name: '清新', color: '#e8f5e9' },
  { name: '宁静', color: '#e3f2fd' },
  { name: '浪漫', color: '#fce4ec' },
  { name: '优雅', color: '#f3e5f5' },
];

// 预设天气
const WEATHER_OPTIONS = [
  { label: '晴天', icon: '☀️' },
  { label: '多云', icon: '⛅' },
  { label: '阴天', icon: '☁️' },
  { label: '小雨', icon: '🌦️' },
  { label: '大雨', icon: '🌧️' },
  { label: '雷雨', icon: '⛈️' },
  { label: '下雪', icon: '❄️' },
  { label: '雾霾', icon: '🌫️' },
];

// 预设心情
const MOOD_OPTIONS = [
  { label: '开心', icon: '😊' },
  { label: '快乐', icon: '😄' },
  { label: '平静', icon: '😌' },
  { label: '难过', icon: '😢' },
  { label: '生气', icon: '😠' },
  { label: '焦虑', icon: '😰' },
  { label: '疲惫', icon: '😴' },
  { label: '兴奋', icon: '🤗' },
];

const DiaryRecords: React.FC = () => {
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentWeather, setCurrentWeather] = useState<string>('');
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('#fffef9');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [customThemeColor, setCustomThemeColor] = useState('#fffef9');
  
  // 保存原始加载的日记数据，用于检测是否有修改
  const [originalEntry, setOriginalEntry] = useState<DiaryEntry | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 检查当前日记是否有修改
  const hasChanges = () => {
    if (!originalEntry) {
      // 新日记：检查是否有任何内容
      return diaryContent.trim() !== '' || currentWeather !== '' || currentMood !== '';
    }
    // 已有日记：检查是否有修改
    return originalEntry.content !== diaryContent ||
           originalEntry.weather !== currentWeather ||
           originalEntry.mood !== currentMood ||
           originalEntry.date !== selectedDate;
  };

  // 加载数据
  useEffect(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    const savedEntries = localStorage.getItem('diaryEntries');
    if (savedNotes) setQuickNotes(JSON.parse(savedNotes));
    if (savedEntries) setDiaryEntries(JSON.parse(savedEntries));
  }, []);

  // 添加速记
  const handleAddQuickNote = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && quickNoteInput.trim()) {
      const newNote: QuickNote = {
        id: Date.now().toString(),
        content: quickNoteInput.trim(),
        timestamp: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      const updatedNotes = [newNote, ...quickNotes];
      setQuickNotes(updatedNotes);
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      setQuickNoteInput('');
    }
  };

  // 删除速记
  const handleDeleteQuickNote = (id: string) => {
    const updatedNotes = quickNotes.filter(note => note.id !== id);
    setQuickNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
  };

  // 保存日记
  const handleSaveDiary = () => {
    if (!diaryContent.trim()) {
      alert('请输入日记内容');
      return;
    }

    const existingIndex = diaryEntries.findIndex(entry => entry.date === selectedDate);
    let updatedEntries;

    if (existingIndex >= 0) {
      // 更新现有日记
      updatedEntries = [...diaryEntries];
      updatedEntries[existingIndex] = {
        ...updatedEntries[existingIndex],
        content: diaryContent,
        weather: currentWeather,
        mood: currentMood,
        theme: currentTheme
      };
    } else {
      // 创建新日记
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        content: diaryContent,
        weather: currentWeather,
        mood: currentMood,
        theme: currentTheme
      };
      updatedEntries = [newEntry, ...diaryEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    
    // 更新原始数据
    const savedEntry = updatedEntries.find(entry => entry.date === selectedDate);
    setOriginalEntry(savedEntry || null);
    
    alert('日记保存成功！');
  };

  // 加载日记
  const handleLoadDiary = (entry: DiaryEntry) => {
    setSelectedDate(entry.date);
    setDiaryContent(entry.content);
    setCurrentWeather(entry.weather || '');
    setCurrentMood(entry.mood || '');
    setCurrentTheme(entry.theme || '#fffef9');
    setOriginalEntry(entry); // 保存原始数据
  };

  // 删除日记
  const handleDeleteDiary = (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？')) return;
    
    const updatedEntries = diaryEntries.filter(entry => entry.id !== id);
    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    
    // 如果删除的是当前选中的日记，清空内容
    const deletedEntry = diaryEntries.find(entry => entry.id !== id);
    if (deletedEntry?.date === selectedDate) {
      setDiaryContent('');
      setCurrentWeather('');
      setCurrentMood('');
      setOriginalEntry(null);
    }
  };

  // 新建日记
  const handleNewDiary = () => {
    // 检查是否有未保存的修改
    if (hasChanges()) {
      if (!window.confirm('当前日记有未保存的修改，确定要新建日记吗？')) {
        return;
      }
    }
    
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDiaryContent('');
    setCurrentWeather('');
    setCurrentMood('');
    setCurrentTheme('#fffef9');
    setOriginalEntry(null);
  };

  return (
    <div className="diary-records">
      {/* 左侧：速记区 */}
      <div className="diary-records__quick-notes">
        <div className="quick-notes__header">
          <h3>💭 速记</h3>
        </div>
        <div className="quick-notes__input">
          <textarea
            placeholder="记录你的灵感（按Ctrl+Enter保存）"
            value={quickNoteInput}
            onChange={(e) => setQuickNoteInput(e.target.value)}
            onKeyDown={handleAddQuickNote}
          />
        </div>
        <div className="quick-notes__list">
          {quickNotes.map(note => (
            <div key={note.id} className="quick-note-item">
              <div className="quick-note-item__content">{note.content}</div>
              <div className="quick-note-item__footer">
                <span className="timestamp">{note.timestamp}</span>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteQuickNote(note.id)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：日记本 */}
      <div className="diary-records__notebook">
        <div className="notebook__spine"></div>
        <div className="notebook__page" style={{ backgroundColor: currentTheme }}>
          <div className="notebook__header">
            <div className="notebook__header-left">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
              
              {/* 主题颜色选择器 */}
              <div 
                className="action-dropdown"
                onMouseEnter={() => {
                  setShowThemePicker(true);
                  setShowWeatherPicker(false);
                  setShowMoodPicker(false);
                }}
                onMouseLeave={() => setShowThemePicker(false)}
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
                            setCurrentTheme(theme.color);
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
                          onChange={(e) => setCustomThemeColor(e.target.value)}
                        />
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCurrentTheme(customThemeColor);
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
                  setShowWeatherPicker(true);
                  setShowThemePicker(false);
                  setShowMoodPicker(false);
                }}
                onMouseLeave={() => setShowWeatherPicker(false)}
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
                          setCurrentWeather(weather.label);
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
                  setShowMoodPicker(true);
                  setShowThemePicker(false);
                  setShowWeatherPicker(false);
                }}
                onMouseLeave={() => setShowMoodPicker(false)}
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
                          setCurrentMood(mood.label);
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
              <button className="action-icon-btn" onClick={handleNewDiary} title="新建">
                📄
              </button>
              <button className="action-icon-btn" onClick={handleSaveDiary} title="保存">
                💾
              </button>
            </div>
          </div>
          
          <div className="notebook__content">
            <textarea
              ref={textareaRef}
              placeholder="记录你的灵感（按Ctrl+Enter保存）"
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
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

      {/* 右侧：日记列表 */}
      <div className="diary-records__list">
        <div className="diary-list__header">
          <h3>📚 日记列表</h3>
          <span className="diary-count">{diaryEntries.length} 篇</span>
        </div>
        <div className="diary-list__items">
          {diaryEntries.map(entry => (
            <div 
              key={entry.id} 
              className={`diary-item ${entry.date === selectedDate ? 'diary-item--active' : ''}`}
              onClick={() => handleLoadDiary(entry)}
            >
              <div className="diary-item__header">
                <span className="diary-item__date">
                  📅 {new Date(entry.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <div className="diary-item__meta">
                  {entry.weather && (
                    <span className="diary-item__weather">
                      {WEATHER_OPTIONS.find(w => w.label === entry.weather)?.icon}
                    </span>
                  )}
                  {entry.mood && (
                    <span className="diary-item__mood">
                      {MOOD_OPTIONS.find(m => m.label === entry.mood)?.icon}
                    </span>
                  )}
                  <button 
                    className="diary-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDiary(entry.id);
                    }}
                    title="删除记录"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="diary-item__preview">
                {entry.content.substring(0, 100)}
                {entry.content.length > 100 && '...'}
              </div>
            </div>
          ))}
          {diaryEntries.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📖</div>
              <p>还没有日记哦</p>
              <p className="empty-state__hint">在中间写下你的第一篇日记吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryRecords;
