import React, { useState, useEffect, useCallback } from 'react';
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
} from '@/utils/music';
import './Diary.scss';

const Music: React.FC = () => {
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
  
  // 速记是否有未保存的修改
  const [hasUnsavedQuickNote, setHasUnsavedQuickNote] = useState<boolean>(false);

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

  // 检查是否有未保存的更改
  const hasUnsavedChanges = useCallback((): boolean => {
    if (!initialDiaryState) return false;
    
    return (
      diaryContent !== initialDiaryState.content ||
      currentTheme !== initialDiaryState.theme ||
      currentWeather !== initialDiaryState.weather ||
      currentMood !== initialDiaryState.mood ||
      currentFont !== initialDiaryState.font
    );
  }, [diaryContent, currentTheme, currentWeather, currentMood, currentFont, initialDiaryState]);

  // 监听全局速记添加事件
  useEffect(() => {
    const handleQuickNoteAdded = () => {
      // 重新加载速记列表
      const notes = loadQuickNotes();
      setQuickNotes(notes);
    };

    window.addEventListener('quickNoteAdded', handleQuickNoteAdded);
    return () => {
      window.removeEventListener('quickNoteAdded', handleQuickNoteAdded);
    };
  }, []);

  // 监听模式切换器的点击事件，检查是否有未保存的修改
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 检查点击是否来自 home__mode-switcher 或其子元素
      const modeSwitcher = target.closest('.home__mode-switcher');
      
      if (modeSwitcher) {
        const hasUnsavedDiary = hasUnsavedChanges();
        let message = '';
        
        // 检查是否有未保存的修改
        if (hasUnsavedDiary && hasUnsavedQuickNote) {
          message = '当前有未保存的音乐日记和速记，是否继续当前操作？\n\n';
        } else if (hasUnsavedDiary) {
          message = '当前有未保存的音乐日记，是否继续当前操作？\n\n';
        } else if (hasUnsavedQuickNote) {
          message = '当前有未保存的速记，是否继续当前操作？\n\n';
        }
        
        if (message) {
          const shouldContinue = window.confirm(message);
          
          if (!shouldContinue) {
            // 用户选择不继续，阻止默认行为
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true); // 使用捕获阶段
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasUnsavedChanges, hasUnsavedQuickNote]);

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
      toast('没有速记可以导出', { icon: '⚠️' });
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


  // 从 HTML 中提取纯文本
  const getTextFromHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // 重置日记状态为新建状态
  const resetDiaryState = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
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
  };

  // 加载日记条目（统一处理）
  const loadDiaryEntry = (entry: DiaryEntry) => {
    setSelectedDate(entry.date);
    setCurrentDiary(entry);
    setDiaryContent(entry.content);
    setCurrentTheme(entry.theme);
    setCurrentWeather(entry.weather);
    setCurrentMood(entry.mood);
    setCurrentFont(entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif");
    
    setInitialDiaryState({
      content: entry.content,
      theme: entry.theme,
      weather: entry.weather,
      mood: entry.mood,
      font: entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  };

  // 保存日记
  const handleSaveDiary = () => {
    // 提取纯文本内容检查是否为空
    const textContent = getTextFromHTML(diaryContent);
    
    // 如果内容为空
    if (!textContent.trim()) {
      // 如果当前日记已存在，视为删除（静默删除，不需要确认）
      if (currentDiary) {
        handleDeleteDiary(currentDiary.id, true);
        return;
      }
      // 如果当前日记是新建的，不做任何操作
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

  // 删除日记（支持静默删除，用于保存空内容时）
  const handleDeleteDiary = (id: string, silent: boolean = false) => {
    // 如果不是静默删除，需要确认
    if (!silent) {
      const confirmed = window.confirm('确定要删除这篇音乐日记吗？\n\n删除后将无法恢复！');
      if (!confirmed) return;
    }
    
    // 通过id删除
    deleteDiaryFromStorage(id);
    
    // 使用函数式更新确保获取最新状态
    setDiaryEntries(prev => {
      const updatedEntries = prev.filter(e => e.id !== id);
      
      // 如果删除的是当前显示的日记
      if (currentDiary?.id === id) {
        // 如果列表中有其他日记，显示第一篇
        if (updatedEntries.length > 0) {
          loadDiaryEntry(updatedEntries[0]);
        } else {
          // 如果列表中没有日记，显示默认的新建页
          resetDiaryState();
        }
      }
      
      return updatedEntries;
    });
    
    // 如果不是静默删除，显示删除成功提示
    if (!silent) {
      toast.success('删除成功', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  // 创建新日记（内部方法）
  const createNewDiary = () => {
    resetDiaryState();
  };

  // 新建日记
  const handleNewDiary = () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      const shouldContinue = window.confirm(
        '当前有未保存的音乐日记，是否继续当前操作？\n\n'
      );
      
      if (!shouldContinue) {
        // 用户选择不继续，保持当前状态
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
      resetDiaryState();
      toast.success(`已删除 ${count} 篇音乐日记`);
    } catch (error) {
      console.error('删除所有日记失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 加载指定日记
  const handleLoadDiary = (entry: DiaryEntry) => {
    // 如果点击的是当前正在查看的日记，不进行任何操作
    if (currentDiary?.id === entry.id) {
      return;
    }
    
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      const shouldContinue = window.confirm(
        '当前有未保存的音乐日记，是否继续当前操作？\n\n'
      );
      
      if (!shouldContinue) {
        // 用户选择不继续，保持当前状态
        return;
      }
    }
    
    // 直接加载点击的日记
    loadDiaryEntry(entry);
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
    <div className="music">
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
        onHasUnsavedChangesChange={setHasUnsavedQuickNote}
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

export default Music;
