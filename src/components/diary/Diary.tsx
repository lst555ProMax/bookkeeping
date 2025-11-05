import React, { useState, useEffect } from 'react';
import QuickNotes from './QuickNotes/QuickNotes';
import DiaryNotebook from './DiaryNotebook/DiaryNotebook';
import DiaryList from './DiaryList/DiaryList';
import { QuickNote, DiaryEntry } from './types';
import './Diary.scss';

const Diary: React.FC = () => {
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

  // 检查当前日记是否有修改
  const hasChanges = () => {
    if (!originalEntry) {
      return diaryContent.trim() !== '' || currentWeather !== '' || currentMood !== '';
    }
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
      updatedEntries = [...diaryEntries];
      updatedEntries[existingIndex] = {
        ...updatedEntries[existingIndex],
        content: diaryContent,
        weather: currentWeather,
        mood: currentMood,
        theme: currentTheme
      };
    } else {
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
    setOriginalEntry(entry);
  };

  // 删除日记
  const handleDeleteDiary = (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？')) return;
    
    const updatedEntries = diaryEntries.filter(entry => entry.id !== id);
    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    
    const deletedEntry = diaryEntries.find(entry => entry.id === id);
    if (deletedEntry?.date === selectedDate) {
      setDiaryContent('');
      setCurrentWeather('');
      setCurrentMood('');
      setOriginalEntry(null);
    }
  };

  // 新建日记
  const handleNewDiary = () => {
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
    <div className="diary">
      <QuickNotes
        quickNotes={quickNotes}
        quickNoteInput={quickNoteInput}
        onQuickNoteInputChange={setQuickNoteInput}
        onAddQuickNote={handleAddQuickNote}
        onDeleteQuickNote={handleDeleteQuickNote}
      />
      
      <DiaryNotebook
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentWeather={currentWeather}
        onWeatherChange={setCurrentWeather}
        currentMood={currentMood}
        onMoodChange={setCurrentMood}
        diaryContent={diaryContent}
        onContentChange={setDiaryContent}
        onSave={handleSaveDiary}
        onNew={handleNewDiary}
        showThemePicker={showThemePicker}
        onShowThemePickerChange={setShowThemePicker}
        showWeatherPicker={showWeatherPicker}
        onShowWeatherPickerChange={setShowWeatherPicker}
        showMoodPicker={showMoodPicker}
        onShowMoodPickerChange={setShowMoodPicker}
        customThemeColor={customThemeColor}
        onCustomThemeColorChange={setCustomThemeColor}
      />
      
      <DiaryList
        diaryEntries={diaryEntries}
        selectedDate={selectedDate}
        onLoadDiary={handleLoadDiary}
        onDeleteDiary={handleDeleteDiary}
      />
    </div>
  );
};

export default Diary;
