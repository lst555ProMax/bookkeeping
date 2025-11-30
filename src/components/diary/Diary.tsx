import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import QuickNotes from './QuickNotes/QuickNotes';
import DiaryNotebook, { DiaryNotebookRef } from './DiaryNotebook/DiaryNotebook';
import DiaryList from './DiaryList/DiaryList';
import {
  QuickNote,
  DiaryEntry,
  loadQuickNotes,
  addQuickNote as addQuickNoteToStorage,
  updateQuickNote as updateQuickNoteInStorage,
  deleteQuickNote as deleteQuickNoteFromStorage,
  clearAllQuickNotes,
  loadDiaryEntries,
  saveDiaryEntry as saveDiaryToStorage,
  deleteDiaryEntry as deleteDiaryFromStorage,
  clearAllDiaryEntries
} from '@/utils';
import {
  exportQuickNotesOnly,
  importQuickNotesOnly,
  exportDiaryEntriesOnly,
  importDiaryEntriesOnly,
  validateDiaryImportFile
} from '@/utils/diary/dataImportExport';
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
  const [currentTheme, setCurrentTheme] = useState<string>('#FFFFFF');
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
    date: string;
    content: string;
    theme: string;
    weather: string;
    mood: string;
    font: string;
  } | null>(null);
  
  // DiaryNotebook ref for focusing editor
  const diaryNotebookRef = useRef<DiaryNotebookRef>(null);
  
  // 速记是否有未保存的修改
  const [hasUnsavedQuickNote, setHasUnsavedQuickNote] = useState<boolean>(false);
  
  // 文件输入引用
  const quickNotesFileInputRef = useRef<HTMLInputElement>(null);
  const diaryEntriesFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingQuickNotes, setIsImportingQuickNotes] = useState(false);
  const [isImportingDiaryEntries, setIsImportingDiaryEntries] = useState(false);

  // 从 HTML 中提取纯文本，保留换行
  const getTextFromHTML = useCallback((html: string): string => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // 将 <p> 标签转换为换行符，保留文本内容
    const paragraphs = div.querySelectorAll('p');
    if (paragraphs.length > 0) {
      return Array.from(paragraphs)
        .map(p => (p.textContent || '').trim())
        .join('\n');
    }
    // 如果没有 <p> 标签，直接返回文本内容
    return div.textContent || div.innerText || '';
  }, []);

  // 重置日记状态为新建状态
  // 标准化颜色值（将 #fff 转换为 #FFFFFF）
  const normalizeColor = (color: string): string => {
    if (!color || !color.startsWith('#')) return color;
    // 如果是3位十六进制颜色（如 #fff），转换为6位（#FFFFFF）
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
    }
    return color.toUpperCase();
  };

  const resetDiaryState = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setCurrentDiary(null);
    setDiaryContent('');
    setCurrentTheme('#FFFFFF');
    setCurrentWeather('晴天');
    setCurrentMood('开心');
    setCurrentFont("'Courier New', 'STKaiti', 'KaiTi', serif");
    
    setInitialDiaryState({
      date: today,
      content: '',
      theme: '#FFFFFF',
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
    // 标准化颜色值，确保一致性
    const normalizedTheme = normalizeColor(entry.theme || '#FFFFFF');
    setCurrentTheme(normalizedTheme);
    setCurrentWeather(entry.weather);
    setCurrentMood(entry.mood);
    setCurrentFont(entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif");
    
    setInitialDiaryState({
      date: entry.date,
      content: entry.content,
      theme: normalizedTheme,
      weather: entry.weather,
      mood: entry.mood,
      font: entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  };

  // 加载数据
  useEffect(() => {
    const notes = loadQuickNotes();
    setQuickNotes(notes);
    
    const entries = loadDiaryEntries();
    setDiaryEntries(entries);
    
    // 如果有日记，自动加载第一篇；否则初始化为空白新建状态
    if (entries.length > 0) {
      loadDiaryEntry(entries[0]);
    } else {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setInitialDiaryState({
        date: todayStr,
        content: '',
        theme: '#fff',
        weather: '晴天',
        mood: '开心',
        font: "'Courier New', 'STKaiti', 'KaiTi', serif"
      });
    }
  }, []);

  // 检查是否有未保存的更改
  const hasUnsavedChanges = useCallback((): boolean => {
    // 如果没有初始状态，返回false
    if (!initialDiaryState) return false;
    
    // 如果是新建状态（currentDiary为null），检查是否有实际内容变化
    if (!currentDiary) {
      // 提取纯文本内容，检查是否为空（去除HTML标签和空白）
      const plainText = getTextFromHTML(diaryContent).trim();
      const hasContent = plainText !== '';
      
      // 检查其他字段是否有变化（使用标准化后的颜色值进行比较）
      const hasDateChange = selectedDate !== initialDiaryState.date;
      const hasThemeChange = normalizeColor(currentTheme) !== normalizeColor(initialDiaryState.theme);
      const hasWeatherChange = currentWeather !== initialDiaryState.weather;
      const hasMoodChange = currentMood !== initialDiaryState.mood;
      const hasFontChange = currentFont !== initialDiaryState.font;
      
      // 如果没有任何实际变化，返回false
      return hasContent || hasDateChange || hasThemeChange || hasWeatherChange || hasMoodChange || hasFontChange;
    }
    
    // 编辑状态下，检查是否有变化
    // 直接比较 HTML 内容，这样可以检测到样式变化（加粗、颜色、高亮等）
    const hasContentChange = diaryContent !== initialDiaryState.content;
    
    return (
      hasContentChange ||
      selectedDate !== initialDiaryState.date ||
      normalizeColor(currentTheme) !== normalizeColor(initialDiaryState.theme) ||
      currentWeather !== initialDiaryState.weather ||
      currentMood !== initialDiaryState.mood ||
      currentFont !== initialDiaryState.font
    );
  }, [currentDiary, selectedDate, diaryContent, currentTheme, currentWeather, currentMood, currentFont, initialDiaryState, getTextFromHTML]);

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
          message = '当前有未保存的日记和速记，是否继续当前操作？\n\n';
        } else if (hasUnsavedDiary) {
          message = '当前有未保存的日记，是否继续当前操作？\n\n';
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
    try {
      // 计算筛选后的速记
      const filtered = quickNotes.filter(note => {
        if (!quickNotesSearch.trim()) return true;
        return note.content.toLowerCase().includes(quickNotesSearch.toLowerCase());
      });
      
      const message = `确定导出速记吗？\n\n速记：${filtered.length} 条${quickNotesSearch.trim() ? `（已筛选）` : ''}`;
      
      if (window.confirm(message)) {
        exportQuickNotesOnly(filtered);
        toast.success('速记数据导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理速记导入
  const handleImportQuickNotes = async (file: File) => {
    setIsImportingQuickNotes(true);
    try {
      const result = await importQuickNotesOnly(file);
      const notes = loadQuickNotes();
      setQuickNotes(notes);
      
      const message = `导入完成！\n新增 ${result.imported} 条速记，跳过 ${result.skipped} 条重复记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingQuickNotes(false);
      if (quickNotesFileInputRef.current) {
        quickNotesFileInputRef.current.value = '';
      }
    }
  };

  // 处理速记文件选择
  const handleQuickNotesFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateDiaryImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportQuickNotes(file);
  };

  // 触发速记文件选择
  const triggerQuickNotesFileSelect = () => {
    quickNotesFileInputRef.current?.click();
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

  // 保存日记
  const handleSaveDiary = () => {
    // 提取纯文本内容检查是否为空
    const textContent = getTextFromHTML(diaryContent);
    
    // 判断是新建还是更新
    const isNewDiary = !currentDiary;
    
    // 如果内容为空
    if (!textContent.trim()) {
      // 如果当前日记已存在，视为删除（直接删除并显示删除成功提示，不需要确认）
      if (currentDiary) {
        const id = currentDiary.id;
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
        
        // 显示删除成功提示
        toast.success('删除成功', {
          duration: 2000,
          position: 'top-center',
        });
        return;
      }
      // 如果当前日记是新建的且没有内容，提示无法保存
      if (isNewDiary) {
        toast.error('无法保存：日记内容不能为空', {
          duration: 2000,
          position: 'top-center',
        });
        return;
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
      date: selectedDate,
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
    if (isNewDiary) {
      toast.success('创建新日记成功', {
        duration: 2000,
        position: 'top-center',
      });
    } else {
      toast.success('保存成功', {
        duration: 2000,
        position: 'top-center',
      });
    }
    
    // 保存后让编辑器失去焦点
    setTimeout(() => {
      diaryNotebookRef.current?.blurEditor();
    }, 100);
  };

  // 删除日记（支持静默删除，用于保存空内容时）
  const handleDeleteDiary = (id: string, silent: boolean = false) => {
    // 如果不是静默删除，需要确认
    if (!silent) {
      const confirmed = window.confirm('确定要删除这篇日记吗？\n\n删除后将无法恢复！');
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

  // 新建日记
  const handleNewDiary = () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      const shouldContinue = window.confirm(
        '当前有未保存的日记，是否继续当前操作？\n\n'
      );
      
      if (!shouldContinue) {
        // 用户选择不继续，保持当前状态
        return;
      }
    }
    
    // 创建新日记
    resetDiaryState();
    
    // 显示创建新日记提示
    toast.success('已创建新日记', {
      duration: 2000,
      position: 'top-center',
    });
  };

  // 导出所有日记（使用筛选后的数据）
  const handleExportDiaryEntries = () => {
    try {
      // 计算筛选后的日记
      const filtered = diaryEntries
        .filter(entry => {
          if (!diaryEntriesSearch.trim()) return true;
          // 提取纯文本进行搜索，避免搜索到HTML标签
          const plainText = getTextFromHTML(entry.content);
          return plainText.toLowerCase().includes(diaryEntriesSearch.toLowerCase());
        })
        .sort((a, b) => {
          // 先按日期倒序排序
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          // 如果日期相同，按创建时间倒序排序
          return b.createdAt - a.createdAt;
        });
      
      const message = `确定导出日记吗？\n\n日记：${filtered.length} 篇${diaryEntriesSearch.trim() ? `（已筛选）` : ''}`;
      
      if (window.confirm(message)) {
        exportDiaryEntriesOnly(filtered);
        toast.success('日记数据导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理日记导入
  const handleImportDiaryEntries = async (file: File) => {
    setIsImportingDiaryEntries(true);
    try {
      const result = await importDiaryEntriesOnly(file);
      const entries = loadDiaryEntries();
      setDiaryEntries(entries);
      
      const message = `导入完成！\n新增 ${result.imported} 篇日记，跳过 ${result.skipped} 篇重复记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingDiaryEntries(false);
      if (diaryEntriesFileInputRef.current) {
        diaryEntriesFileInputRef.current.value = '';
      }
    }
  };

  // 处理日记文件选择
  const handleDiaryEntriesFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateDiaryImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportDiaryEntries(file);
  };

  // 触发日记文件选择
  const triggerDiaryEntriesFileSelect = () => {
    diaryEntriesFileInputRef.current?.click();
  };

  // 删除所有日记
  const handleDeleteAllDiaryEntries = () => {
    try {
      const count = clearAllDiaryEntries();
      setDiaryEntries([]);
      resetDiaryState();
      toast.success(`已删除 ${count} 篇日记`);
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
        '当前有未保存的日记，是否继续当前操作？\n\n'
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

  // 筛选日记（基于纯文本搜索）
  const filteredDiaryEntries = diaryEntries
    .filter(entry => {
      if (!diaryEntriesSearch.trim()) return true;
      // 提取纯文本进行搜索，避免搜索到HTML标签
      const plainText = getTextFromHTML(entry.content);
      return plainText.toLowerCase().includes(diaryEntriesSearch.toLowerCase());
    })
    .sort((a, b) => {
      // 先按日期倒序排序
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      // 如果日期相同，按创建时间倒序排序
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="diary">
      {/* 隐藏的文件输入 */}
      <input
        ref={quickNotesFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleQuickNotesFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={diaryEntriesFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleDiaryEntriesFileSelect}
        style={{ display: 'none' }}
      />
      
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
        onImportAll={triggerQuickNotesFileSelect}
        onDeleteAll={handleDeleteAllQuickNotes}
        onHasUnsavedChangesChange={setHasUnsavedQuickNote}
        isImporting={isImportingQuickNotes}
      />
      
      <DiaryNotebook
        ref={diaryNotebookRef}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
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
        onExportAll={handleExportDiaryEntries}
        onImportAll={triggerDiaryEntriesFileSelect}
        onDeleteAll={handleDeleteAllDiaryEntries}
        searchContent={diaryEntriesSearch}
        onSearchContentChange={setDiaryEntriesSearch}
        isImporting={isImportingDiaryEntries}
        hasUnsavedChanges={hasUnsavedChanges()}
      />
    </div>
  );
};

export default Diary;
