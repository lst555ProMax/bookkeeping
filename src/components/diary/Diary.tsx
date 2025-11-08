import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import QuickNotes from './QuickNotes/QuickNotes';
import DiaryNotebook from './DiaryNotebook/DiaryNotebook';
import DiaryList from './DiaryList/DiaryList';
import {
  QuickNote,
  DiaryEntry,
  loadQuickNotes,
  addQuickNote as addQuickNoteToStorage,
  updateQuickNote as updateQuickNoteInStorage,
  deleteQuickNote as deleteQuickNoteFromStorage,
  saveQuickNotes,
  clearAllQuickNotes,
  loadDiaryEntries,
  saveDiaryEntry as saveDiaryToStorage,
  deleteDiaryEntry as deleteDiaryFromStorage,
  saveDiaryEntries,
  clearAllDiaryEntries
} from '@/utils';
import './Diary.scss';

const Diary: React.FC = () => {
  // 状态管理
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [quickNoteInput, setQuickNoteInput] = useState<string>('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentDiary, setCurrentDiary] = useState<DiaryEntry | null>(null);
  const [diaryContent, setDiaryContent] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('#fff');
  const [currentWeather, setCurrentWeather] = useState<string>('晴天');
  const [currentMood, setCurrentMood] = useState<string>('开心');
  const [currentFont, setCurrentFont] = useState<string>("'Courier New', 'STKaiti', 'KaiTi', serif");
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [showWeatherPicker, setShowWeatherPicker] = useState<boolean>(false);
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);
  const [showFontPicker, setShowFontPicker] = useState<boolean>(false);
  const [customThemeColor, setCustomThemeColor] = useState<string>('#ffffff');
  
  // 搜索状态
  const [quickNotesSearch, setQuickNotesSearch] = useState<string>('');
  const [diaryEntriesSearch, setDiaryEntriesSearch] = useState<string>('');
  
  // 记录初始状态，用于检测是否有未保存的更改
  const [initialDiaryState, setInitialDiaryState] = useState<{
    content: string;
    theme: string;
    weather: string;
    mood: string;
    font: string;
  } | null>(null);

  // 加载数据
  useEffect(() => {
    const notes = loadQuickNotes();
    setQuickNotes(notes);
    
    const entries = loadDiaryEntries();
    setDiaryEntries(entries);
    
    // 初始化为空白新建状态
    setInitialDiaryState({
      content: '',
      theme: '#fff',
      weather: '晴天',
      mood: '开心',
      font: "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  }, []);

  // 添加速记
  const handleAddQuickNote = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && quickNoteInput.trim()) {
      const newNote = addQuickNoteToStorage(quickNoteInput.trim());
      setQuickNotes(prev => [newNote, ...prev]);
      setQuickNoteInput('');
    }
  };

  // 更新速记
  const handleUpdateQuickNote = (id: string, content: string) => {
    const updatedNote = updateQuickNoteInStorage(id, content);
    if (updatedNote) {
      setQuickNotes(prev => 
        prev.map(note => note.id === id ? updatedNote : note)
      );
    }
  };

  // 删除速记
  const handleDeleteQuickNote = (id: string) => {
    deleteQuickNoteFromStorage(id);
    setQuickNotes(prev => prev.filter(note => note.id !== id));
  };

  // 导出所有速记
  const handleExportQuickNotes = () => {
    if (quickNotes.length === 0) {
      alert('没有速记可以导出');
      return;
    }

    const jsonData = JSON.stringify(quickNotes, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
    const date = new Date();
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `速记导出_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入速记
  const handleImportQuickNotes = (notes: QuickNote[]) => {
    try {
      // 合并新导入的速记和现有速记
      const existingNotes = loadQuickNotes();
      const mergedNotes = [...existingNotes];

      notes.forEach(newNote => {
        // 检查是否已存在相同ID的速记
        const existingIndex = mergedNotes.findIndex(n => n.id === newNote.id);
        if (existingIndex >= 0) {
          // 更新现有速记
          mergedNotes[existingIndex] = newNote;
        } else {
          // 添加新速记
          mergedNotes.push(newNote);
        }
      });

      // 按时间戳降序排序
      mergedNotes.sort((a, b) => b.timestamp - a.timestamp);

      saveQuickNotes(mergedNotes);
      setQuickNotes(mergedNotes);
      toast.success(`成功导入 ${notes.length} 条速记`);
    } catch (error) {
      console.error('导入速记失败:', error);
      toast.error('导入失败，请重试');
    }
  };

  // 删除所有速记
  const handleDeleteAllQuickNotes = () => {
    try {
      const count = clearAllQuickNotes();
      setQuickNotes([]);
      toast.success(`已删除 ${count} 条速记`);
    } catch (error) {
      console.error('删除所有速记失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 检查是否有未保存的更改
  const hasUnsavedChanges = (): boolean => {
    if (!initialDiaryState) return false;
    
    return (
      diaryContent !== initialDiaryState.content ||
      currentTheme !== initialDiaryState.theme ||
      currentWeather !== initialDiaryState.weather ||
      currentMood !== initialDiaryState.mood ||
      currentFont !== initialDiaryState.font
    );
  };

  // 保存日记
  const handleSaveDiary = () => {
    // 如果内容为空，不保存并恢复原内容
    if (!diaryContent.trim()) {
      window.alert('日记内容不能为空！');
      // 恢复原内容
      if (initialDiaryState) {
        setDiaryContent(initialDiaryState.content);
        setCurrentTheme(initialDiaryState.theme);
        setCurrentWeather(initialDiaryState.weather);
        setCurrentMood(initialDiaryState.mood);
        setCurrentFont(initialDiaryState.font);
      }
      return;
    }
    
    const entry: DiaryEntry = {
      id: currentDiary?.id || Date.now().toString(),
      date: selectedDate,
      content: diaryContent,
      theme: currentTheme,
      weather: currentWeather,
      mood: currentMood,
      font: currentFont,
      createdAt: currentDiary?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    saveDiaryToStorage(entry);
    setCurrentDiary(entry);
    
    // 更新初始状态
    setInitialDiaryState({
      content: diaryContent,
      theme: currentTheme,
      weather: currentWeather,
      mood: currentMood,
      font: currentFont
    });
    
    // 更新列表
    setDiaryEntries(prev => {
      const index = prev.findIndex(d => d.id === entry.id);
      if (index >= 0) {
        const newEntries = [...prev];
        newEntries[index] = entry;
        return newEntries;
      }
      return [entry, ...prev];
    });
    
    // 显示保存成功提示
    toast.success('保存成功', {
      duration: 2000,
      position: 'top-center',
    });
  };

  // 删除日记
  const handleDeleteDiary = (id: string) => {
    // 确认删除
    const confirmed = window.confirm('确定要删除这篇日记吗？\n\n删除后将无法恢复！');
    if (!confirmed) return;
    
    // 通过id删除
    deleteDiaryFromStorage(id);
    setDiaryEntries(prev => prev.filter(e => e.id !== id));
    
    // 如果删除的是当前显示的日记，重置为新建状态
    if (currentDiary?.id === id) {
      setCurrentDiary(null);
      setDiaryContent('');
      setCurrentTheme('#fff');
      setCurrentWeather('晴天');
      setCurrentMood('开心');
      setCurrentFont("'Courier New', 'STKaiti', 'KaiTi', serif");
      
      setInitialDiaryState({
        content: '',
        theme: '#fff',
        weather: '晴天',
        mood: '开心',
        font: "'Courier New', 'STKaiti', 'KaiTi', serif"
      });
    }
  };

  // 创建新日记（内部方法）
  const createNewDiary = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // 重置为空白状态，使用新的ID确保不会覆盖
    setCurrentDiary(null);
    setDiaryContent('');
    setCurrentTheme('#fff');
    setCurrentWeather('晴天');
    setCurrentMood('开心');
    setCurrentFont("'Courier New', 'STKaiti', 'KaiTi', serif");
    
    // 重置初始状态
    setInitialDiaryState({
      content: '',
      theme: '#fff',
      weather: '晴天',
      mood: '开心',
      font: "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  };

  // 新建日记
  const handleNewDiary = () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      // 如果当前内容为空，提示并恢复原内容
      if (!diaryContent.trim() && initialDiaryState && initialDiaryState.content) {
        window.alert('日记内容不能为空！');
        // 恢复原内容
        setDiaryContent(initialDiaryState.content);
        setCurrentTheme(initialDiaryState.theme);
        setCurrentWeather(initialDiaryState.weather);
        setCurrentMood(initialDiaryState.mood);
        setCurrentFont(initialDiaryState.font);
        return;
      }
      
      const shouldDiscard = window.confirm(
        '当前有未保存的内容，是否放弃修改并新建？\n\n' +
        '点击"确定"放弃当前内容并新建\n' +
        '点击"取消"继续编辑'
      );
      
      if (!shouldDiscard) {
        // 用户选择继续编辑，不执行新建操作
        return;
      }
    }
    
    // 创建新日记
    createNewDiary();
  };

  // 导入所有日记
  const handleImportAll = (entries: DiaryEntry[]) => {
    try {
      // 合并新导入的日记和现有日记
      const existingEntries = loadDiaryEntries();
      const mergedEntries = [...existingEntries];

      entries.forEach(newEntry => {
        // 检查是否已存在相同ID的日记
        const existingIndex = mergedEntries.findIndex(e => e.id === newEntry.id);
        if (existingIndex >= 0) {
          // 更新现有日记
          mergedEntries[existingIndex] = newEntry;
        } else {
          // 添加新日记
          mergedEntries.push(newEntry);
        }
      });

      // 排序并保存
      mergedEntries.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.createdAt - a.createdAt;
      });

      saveDiaryEntries(mergedEntries);
      setDiaryEntries(mergedEntries);
      toast.success(`成功导入 ${entries.length} 篇日记`);
    } catch (error) {
      console.error('导入日记失败:', error);
      toast.error('导入失败，请重试');
    }
  };

  // 删除所有日记
  const handleDeleteAll = () => {
    try {
      const count = clearAllDiaryEntries();
      setDiaryEntries([]);
      
      // 重置为新建状态
      setCurrentDiary(null);
      setDiaryContent('');
      setCurrentTheme('#fff');
      setCurrentWeather('晴天');
      setCurrentMood('开心');
      setCurrentFont("'Courier New', 'STKaiti', 'KaiTi', serif");
      
      setInitialDiaryState({
        content: '',
        theme: '#fff',
        weather: '晴天',
        mood: '开心',
        font: "'Courier New', 'STKaiti', 'KaiTi', serif"
      });

      toast.success(`已删除 ${count} 篇日记`);
    } catch (error) {
      console.error('删除所有日记失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 加载指定日记
  const handleLoadDiary = (entry: DiaryEntry) => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      // 如果当前内容为空，提示并恢复原内容
      if (!diaryContent.trim() && initialDiaryState && initialDiaryState.content) {
        window.alert('日记内容不能为空！');
        // 恢复原内容
        setDiaryContent(initialDiaryState.content);
        setCurrentTheme(initialDiaryState.theme);
        setCurrentWeather(initialDiaryState.weather);
        setCurrentMood(initialDiaryState.mood);
        setCurrentFont(initialDiaryState.font);
        return;
      }
      
      const shouldSave = window.confirm(
        '当前有未保存的内容，是否保存？\n\n' +
        '点击"确定"保存后切换\n' +
        '点击"取消"放弃更改并切换'
      );
      
      if (shouldSave) {
        // 保存当前日记
        handleSaveDiary();
        // 如果保存失败（内容为空），不切换
        if (!diaryContent.trim()) {
          return;
        }
      }
    }
    
    // 直接加载点击的日记
    setSelectedDate(entry.date);
    setCurrentDiary(entry);
    setDiaryContent(entry.content);
    setCurrentTheme(entry.theme);
    setCurrentWeather(entry.weather);
    setCurrentMood(entry.mood);
    setCurrentFont(entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif");
    
    // 记录初始状态
    setInitialDiaryState({
      content: entry.content,
      theme: entry.theme,
      weather: entry.weather,
      mood: entry.mood,
      font: entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  };

  // 筛选速记
  const filteredQuickNotes = quickNotes.filter(note => {
    if (!quickNotesSearch.trim()) return true;
    return note.content.toLowerCase().includes(quickNotesSearch.toLowerCase());
  });

  // 筛选日记
  const filteredDiaryEntries = diaryEntries.filter(entry => {
    if (!diaryEntriesSearch.trim()) return true;
    return entry.content.toLowerCase().includes(diaryEntriesSearch.toLowerCase());
  });

  return (
    <div className="diary">
      <QuickNotes
        quickNotes={filteredQuickNotes}
        quickNoteInput={quickNoteInput}
        onQuickNoteInputChange={setQuickNoteInput}
        onAddQuickNote={handleAddQuickNote}
        onUpdateQuickNote={handleUpdateQuickNote}
        onDeleteQuickNote={handleDeleteQuickNote}
        searchContent={quickNotesSearch}
        onSearchContentChange={setQuickNotesSearch}
        onExportAll={handleExportQuickNotes}
        onImportAll={handleImportQuickNotes}
        onDeleteAll={handleDeleteAllQuickNotes}
      />
      
      <DiaryNotebook
        selectedDate={selectedDate}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        currentWeather={currentWeather}
        onWeatherChange={setCurrentWeather}
        currentMood={currentMood}
        onMoodChange={setCurrentMood}
        currentFont={currentFont}
        onFontChange={setCurrentFont}
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
        showFontPicker={showFontPicker}
        onShowFontPickerChange={setShowFontPicker}
        customThemeColor={customThemeColor}
        onCustomThemeColorChange={setCustomThemeColor}
      />
      
      <DiaryList
        diaryEntries={filteredDiaryEntries}
        currentDiaryId={currentDiary?.id || null}
        onLoadDiary={handleLoadDiary}
        onDeleteDiary={handleDeleteDiary}
        onImportAll={handleImportAll}
        onDeleteAll={handleDeleteAll}
        searchContent={diaryEntriesSearch}
        onSearchContentChange={setDiaryEntriesSearch}
      />
    </div>
  );
};

export default Diary;
