import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import MusicLyrics from './MusicLyrics/MusicLyrics';
import MusicNotebook, { MusicNotebookRef } from './MusicNotebook/MusicNotebook';
import MusicList from './MusicList/MusicList';
import {
  QuickNote,
  DiaryEntry,
  loadQuickNotes,
  addQuickNote as addQuickNoteToStorage,
  updateQuickNote as updateQuickNoteInStorage,
  deleteQuickNote as deleteQuickNoteFromStorage,
  clearAllQuickNotes,
  loadDiaryEntries,
  loadMusicEntryWithImage,
  saveDiaryEntry as saveDiaryToStorage,
  deleteDiaryEntry as deleteDiaryFromStorage,
  clearAllDiaryEntries
} from '@/utils/music';
import { migrateAllImagesToIndexedDB, needsImageMigration } from '@/utils/music/imageMigration';
import {
  exportQuickNotesOnly,
  importQuickNotesOnly,
  exportDiaryEntriesOnly,
  importDiaryEntriesOnly,
  validateMusicImportFile
} from '@/utils/music/dataImportExport';
import './Music.scss';

const Music: React.FC = () => {
  // 状态管理
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => loadQuickNotes());
  const [quickNoteInput, setQuickNoteInput] = useState<string>('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadDiaryEntries());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentDiary, setCurrentDiary] = useState<DiaryEntry | null>(null);
  const [diaryContent, setDiaryContent] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
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
    image?: string;
    theme: string;
    weather: string;
    mood: string;
    font: string;
  } | null>(null);
  
  // 歌词是否有未保存的修改
  const [hasUnsavedQuickNote, setHasUnsavedQuickNote] = useState<boolean>(false);
  
  // 文件输入引用
  const quickNotesFileInputRef = useRef<HTMLInputElement>(null);
  const diaryEntriesFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingQuickNotes, setIsImportingQuickNotes] = useState(false);
  
  // MusicNotebook ref for focusing editor
  const musicNotebookRef = useRef<MusicNotebookRef>(null);
  const [isImportingDiaryEntries, setIsImportingDiaryEntries] = useState(false);
  
  // 标记当前正在加载的日记 ID（用于区分加载和用户编辑，避免竞态条件）
  const loadingDiaryIdRef = useRef<string | null>(null);
  // 存储待执行的定时器，用于清理
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 标准化颜色值（将 #fff 转换为 #FFFFFF）
  const normalizeColor = (color: string): string => {
    if (!color || !color.startsWith('#')) return color;
    // 如果是3位十六进制颜色（如 #fff），转换为6位（#FFFFFF）
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
    }
    return color.toUpperCase();
  };

  // 标准化图片值（将 undefined、null、空字符串视为相同）
  const normalizeImage = (image: string | undefined | null): string | undefined => {
    if (!image || image === '' || image === null) {
      return undefined;
    }
    return image;
  };

  // 重置日记状态为新建状态
  const resetDiaryState = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setCurrentDiary(null);
    setDiaryContent('');
    setCurrentImage(undefined);
    setCurrentTheme('#FFFFFF');
    setCurrentWeather('晴天');
    setCurrentMood('开心');
    setCurrentFont("'Courier New', 'STKaiti', 'KaiTi', serif");
    
    setInitialDiaryState({
      date: today,
      content: '',
      image: undefined,
      theme: '#FFFFFF',
      weather: '晴天',
      mood: '开心',
      font: "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
  };

  // 加载日记条目（统一处理，异步加载图片）
  const loadDiaryEntry = async (entry: DiaryEntry) => {
    console.log('📖 [loadDiaryEntry - 乐记] 开始加载日记:', {
      entryId: entry.id,
      previousLoadingId: loadingDiaryIdRef.current,
      previousCurrentDiaryId: currentDiary?.id,
      entryContentLength: entry.content.length,
      entryContentPreview: entry.content.substring(0, 50),
      hasImageId: !!entry.imageId,
      hasImage: !!entry.image
    });
    
    // 清理之前的定时器，避免竞态条件
    if (loadingTimerRef.current) {
      console.log('🧹 [loadDiaryEntry - 乐记] 清理之前的定时器');
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // 标记当前正在加载的日记 ID
    loadingDiaryIdRef.current = entry.id;
    
    // 异步加载图片（如果 entry 有 imageId）
    let entryWithImage = entry;
    if (entry.imageId && !entry.image) {
      try {
        entryWithImage = await loadMusicEntryWithImage(entry);
      } catch (error) {
        console.error('加载图片失败:', error);
        // 加载失败，使用原 entry
      }
    }
    
    setSelectedDate(entryWithImage.date);
    setCurrentDiary(entryWithImage);
    setDiaryContent(entryWithImage.content);
    // 标准化图片值，确保一致性（将 undefined、null、空字符串统一为 undefined）
    const normalizedImage = normalizeImage(entryWithImage.image);
    setCurrentImage(normalizedImage);
    // 标准化颜色值，确保一致性
    const normalizedTheme = normalizeColor(entryWithImage.theme || '#FFFFFF');
    setCurrentTheme(normalizedTheme);
    setCurrentWeather(entryWithImage.weather);
    setCurrentMood(entryWithImage.mood);
    setCurrentFont(entryWithImage.font || "'Courier New', 'STKaiti', 'KaiTi', serif");
    
    // 先设置初始状态为原始内容，后续会在编辑器规范化后更新
    setInitialDiaryState({
      date: entryWithImage.date,
      content: entryWithImage.content,
      image: normalizedImage, // 使用标准化后的图片值
      theme: normalizedTheme,
      weather: entryWithImage.weather,
      mood: entryWithImage.mood,
      font: entryWithImage.font || "'Courier New', 'STKaiti', 'KaiTi', serif"
    });
    
    console.log('📖 [loadDiaryEntry - 乐记] 加载完成，等待编辑器规范化:', {
      entryId: entryWithImage.id,
      loadingDiaryId: loadingDiaryIdRef.current,
      initialContentLength: entryWithImage.content.length,
      initialContentPreview: entryWithImage.content.substring(0, 50),
      hasImage: !!normalizedImage
    });
  };

  // 监听 diaryContent 变化，当加载日记后编辑器规范化完成时，更新 initialDiaryState
  useEffect(() => {
    // 清理之前的定时器
    if (loadingTimerRef.current) {
      console.log('🧹 [useEffect cleanup] 清理之前的定时器');
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // 只有在加载日记时（loadingDiaryIdRef.current 不为 null）
    // 且 currentDiary 存在
    // 且当前加载的日记 ID 与 currentDiary.id 匹配时才更新
    if (loadingDiaryIdRef.current && currentDiary && initialDiaryState && loadingDiaryIdRef.current === currentDiary.id) {
      // 已经读取了 currentDiary.id，需要在 setTimeout 中再次验证
      const currentDiaryId = currentDiary.id;
      
      console.log('⏳ [useEffect] 检测到内容变化，等待编辑器规范化', {
        loadingDiaryId: loadingDiaryIdRef.current,
        currentDiaryId: currentDiary.id,
        diaryContentLength: diaryContent.length,
        diaryContentPreview: diaryContent.substring(0, 50)
      });
      
      // 使用 setTimeout 确保编辑器已经完成规范化
      loadingTimerRef.current = setTimeout(() => {
        // 再次验证：确保当前加载的日记 ID 仍然匹配
        if (loadingDiaryIdRef.current === currentDiaryId) {
          // 直接从编辑器获取规范化后的 HTML，而不是使用 diaryContent（避免闭包问题）
          const normalizedContent = musicNotebookRef.current?.getHTML() || diaryContent;
          
          console.log('⏰ [setTimeout] 定时器执行', {
            loadingDiaryId: loadingDiaryIdRef.current,
            currentDiaryId,
            normalizedContentLength: normalizedContent.length,
            normalizedContentPreview: normalizedContent.substring(0, 50)
          });
          
          // 使用规范化后的内容更新 initialDiaryState
          setInitialDiaryState(prev => {
            if (prev) {
              console.log('✅ [setTimeout] 更新 initialDiaryState', {
                oldContentLength: prev.content.length,
                newContentLength: normalizedContent.length,
                oldContentPreview: prev.content.substring(0, 50),
                newContentPreview: normalizedContent.substring(0, 50)
              });
              return {
                ...prev,
                content: normalizedContent // 使用编辑器规范化后的内容
              };
            }
            return prev;
          });
          // 重置加载标志
          loadingDiaryIdRef.current = null;
        } else {
          console.log('❌ [setTimeout] ID 不匹配，跳过更新', {
            loadingDiaryId: loadingDiaryIdRef.current,
            currentDiaryId
          });
        }
        loadingTimerRef.current = null;
      }, 50); // 增加延迟，确保编辑器完成规范化
      
      return () => {
        if (loadingTimerRef.current) {
          console.log('🧹 [useEffect cleanup] 清理定时器');
          clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
      };
    } else {
      console.log('ℹ️ [useEffect] 不是加载状态，跳过更新', {
        loadingDiaryId: loadingDiaryIdRef.current,
        currentDiaryId: currentDiary?.id,
        hasInitialDiaryState: !!initialDiaryState
      });
    }
  }, [diaryContent, currentDiary, initialDiaryState]);

  // 加载数据并执行图片迁移
  useEffect(() => {
    const initializeData = async () => {
      // quickNotes 和 diaryEntries 已在初始化时加载
      
      // 检查是否需要迁移图片
      if (needsImageMigration()) {
        console.log('🔄 开始迁移图片到 IndexedDB...');
        try {
          const result = await migrateAllImagesToIndexedDB();
          console.log('✅ 图片迁移完成:', result);
          
          // 重新加载数据（迁移后数据已更新）
          const updatedEntries = loadDiaryEntries();
          setDiaryEntries(updatedEntries);
          
          if (result.migrated > 0) {
            toast.success(
              `图片迁移完成！已迁移 ${result.migrated} 张图片到 IndexedDB，释放了 localStorage 空间`,
              { duration: 4000 }
            );
          }
        } catch (error) {
          console.error('图片迁移失败:', error);
          toast.error('图片迁移失败，请刷新页面重试', { duration: 3000 });
        }
      }
      
      // 如果有日记，自动加载第一篇；否则初始化为空白新建状态
      if (diaryEntries.length > 0) {
        await loadDiaryEntry(diaryEntries[0]);
      } else {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setInitialDiaryState({
          date: todayStr,
          content: '',
          image: undefined,
          theme: '#FFFFFF',
          weather: '晴天',
          mood: '开心',
          font: "'Courier New', 'STKaiti', 'KaiTi', serif"
        });
      }
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // 检查图片是否有变化（undefined/null 视为相同）
      const hasImage = currentImage !== undefined && currentImage !== null && currentImage !== initialDiaryState.image;
      
      // 检查其他字段是否有变化（使用标准化后的颜色值进行比较）
      const hasDateChange = selectedDate !== initialDiaryState.date;
      const hasThemeChange = normalizeColor(currentTheme) !== normalizeColor(initialDiaryState.theme);
      const hasWeatherChange = currentWeather !== initialDiaryState.weather;
      const hasMoodChange = currentMood !== initialDiaryState.mood;
      const hasFontChange = currentFont !== initialDiaryState.font;
      
      // 如果没有任何实际变化，返回false
      return hasContent || hasImage || hasDateChange || hasThemeChange || hasWeatherChange || hasMoodChange || hasFontChange;
    }
    
    // 编辑状态下，检查是否有变化
    // 直接比较 HTML 内容，这样可以检测到样式变化（加粗、颜色、高亮等）
    const hasContentChange = diaryContent !== initialDiaryState.content;
    
    // 标准化图片值后比较（将 undefined、null、空字符串视为相同）
    const normalizedCurrentImage = normalizeImage(currentImage);
    const normalizedInitialImage = normalizeImage(initialDiaryState.image);
    const hasImageChange = normalizedCurrentImage !== normalizedInitialImage;
    
    const hasDateChange = selectedDate !== initialDiaryState.date;
    const normalizedCurrentTheme = normalizeColor(currentTheme);
    const normalizedInitialTheme = normalizeColor(initialDiaryState.theme);
    const hasThemeChange = normalizedCurrentTheme !== normalizedInitialTheme;
    const hasWeatherChange = currentWeather !== initialDiaryState.weather;
    const hasMoodChange = currentMood !== initialDiaryState.mood;
    const hasFontChange = currentFont !== initialDiaryState.font;
    
    const result = (
      hasContentChange ||
      hasDateChange ||
      hasImageChange ||
      hasThemeChange ||
      hasWeatherChange ||
      hasMoodChange ||
      hasFontChange
    );
    
    // 调试信息：如果检测到未保存的更改，打印详细信息
    if (result) {
      console.log('⚠️ [hasUnsavedChanges - 乐记] 检测到未保存的更改:', {
        currentDiaryId: currentDiary.id,
        loadingDiaryId: loadingDiaryIdRef.current,
        hasContentChange,
        contentLengthCurrent: diaryContent.length,
        contentLengthInitial: initialDiaryState.content.length,
        contentCurrent: diaryContent,
        contentInitial: initialDiaryState.content,
        contentDiff: diaryContent !== initialDiaryState.content ? '内容不同' : '内容相同',
        hasDateChange,
        dateCurrent: selectedDate,
        dateInitial: initialDiaryState.date,
        hasImageChange,
        imageCurrent: normalizedCurrentImage ? '有图片' : '无图片',
        imageInitial: normalizedInitialImage ? '有图片' : '无图片',
        imageCurrentRaw: currentImage ? '有图片' : '无图片',
        imageInitialRaw: initialDiaryState.image ? '有图片' : '无图片',
        hasThemeChange,
        themeCurrent: normalizedCurrentTheme,
        themeInitial: normalizedInitialTheme,
        hasWeatherChange,
        weatherCurrent: currentWeather,
        weatherInitial: initialDiaryState.weather,
        hasMoodChange,
        moodCurrent: currentMood,
        moodInitial: initialDiaryState.mood,
        hasFontChange,
        fontCurrent: currentFont,
        fontInitial: initialDiaryState.font
      });
    }
    
    return result;
  }, [currentDiary, selectedDate, diaryContent, currentImage, currentTheme, currentWeather, currentMood, currentFont, initialDiaryState, getTextFromHTML]);

  // 监听全局歌词添加事件
  useEffect(() => {
    const handleQuickNoteAdded = () => {
      // 重新加载歌词列表
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
          message = '当前有未保存的乐记和歌词，是否继续当前操作？\n\n';
        } else if (hasUnsavedDiary) {
          message = '当前有未保存的乐记，是否继续当前操作？\n\n';
        } else if (hasUnsavedQuickNote) {
          message = '当前有未保存的歌词，是否继续当前操作？\n\n';
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

  // 添加歌词
  const handleAddQuickNote = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && quickNoteInput.trim()) {
      const newNote = addQuickNoteToStorage(quickNoteInput.trim());
      setQuickNotes(prev => [newNote, ...prev]);
      setQuickNoteInput('');
    }
  };

  // 更新歌词
  const handleUpdateQuickNote = (id: string, content: string) => {
    const updatedNote = updateQuickNoteInStorage(id, content);
    if (updatedNote) {
      setQuickNotes(prev => 
        prev.map(note => note.id === id ? updatedNote : note)
      );
    }
  };

  // 删除歌词
  const handleDeleteQuickNote = (id: string) => {
    deleteQuickNoteFromStorage(id);
    setQuickNotes(prev => prev.filter(note => note.id !== id));
  };

  // 导出所有歌词
  const handleExportQuickNotes = () => {
    try {
      // 计算筛选后的歌词
      const filtered = quickNotes.filter(note => {
        if (!quickNotesSearch.trim()) return true;
        return note.content.toLowerCase().includes(quickNotesSearch.toLowerCase());
      });
      
      const message = `确定导出歌词吗？\n\n歌词：${filtered.length} 条${quickNotesSearch.trim() ? `（已筛选）` : ''}`;
      
      if (window.confirm(message)) {
        exportQuickNotesOnly(filtered);
        toast.success('歌词数据导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理歌词导入
  const handleImportQuickNotes = async (file: File) => {
    setIsImportingQuickNotes(true);
    try {
      const result = await importQuickNotesOnly(file);
      const notes = loadQuickNotes();
      setQuickNotes(notes);
      
      const message = `导入完成！\n新增 ${result.imported} 条歌词，跳过 ${result.skipped} 条重复记录`;
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

  // 处理歌词文件选择
  const handleQuickNotesFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateMusicImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportQuickNotes(file);
  };

  // 触发歌词文件选择
  const triggerQuickNotesFileSelect = () => {
    quickNotesFileInputRef.current?.click();
  };

  // 删除所有歌词
  const handleDeleteAllQuickNotes = () => {
    try {
      const count = clearAllQuickNotes();
      setQuickNotes([]);
      toast.success(`已删除 ${count} 条歌词`);
      } catch (error) {
      console.error('删除所有歌词失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 保存日记
  const handleSaveDiary = async () => {
    // 从编辑器获取规范化后的 HTML（确保与编辑器显示的内容一致）
    const normalizedContent = musicNotebookRef.current?.getHTML() || diaryContent;
    
    // 提取纯文本内容检查是否为空
    const textContent = getTextFromHTML(normalizedContent);
    
    // 判断是新建还是更新
    const isNewDiary = !currentDiary;
    
    // 检查是否有图片
    const hasImage = currentImage !== undefined && currentImage !== null && currentImage !== '';
    
    // 如果既没有文字也没有图片，才视为删除
    if (!textContent.trim() && !hasImage) {
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
      // 如果当前日记是新建的且既没有内容也没有图片，提示无法保存
      if (isNewDiary) {
        toast.error('无法保存：乐记内容不能为空', {
          duration: 2000,
          position: 'top-center',
        });
        return;
      }
      return;
    }
    
    // 标准化图片值，确保一致性
    const normalizedImage = normalizeImage(currentImage);
    
    const entry: DiaryEntry = {
      id: currentDiary?.id || Date.now().toString(),
      date: selectedDate,
      content: normalizedContent, // 使用编辑器规范化后的内容
      image: normalizedImage,
      theme: currentTheme,
      weather: currentWeather,
      mood: currentMood,
      font: currentFont,
      createdAt: currentDiary?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    const savedEntry = await saveDiaryToStorage(entry);
    setCurrentDiary(savedEntry);
    
    // 更新初始状态（使用标准化后的图片值和规范化后的内容）
    setInitialDiaryState({
      date: selectedDate,
      content: normalizedContent, // 使用编辑器规范化后的内容
      image: normalizedImage,
      theme: currentTheme,
      weather: currentWeather,
      mood: currentMood,
      font: currentFont
    });
    
    // 同步更新 currentImage 为标准化后的值
    setCurrentImage(normalizedImage);
    
    // 更新列表（使用保存后的 entry，包含 imageId）
    setDiaryEntries(prev => {
      const index = prev.findIndex(d => d.id === savedEntry.id);
      if (index >= 0) {
        const newEntries = [...prev];
        newEntries[index] = savedEntry;
        return newEntries;
      }
      return [savedEntry, ...prev];
    });
    
    // 显示保存成功提示
    if (isNewDiary) {
      toast.success('创建新乐记成功', {
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
      musicNotebookRef.current?.blurEditor();
    }, 100);
  };

  // 删除日记（支持静默删除，用于保存空内容时）
  const handleDeleteDiary = async (id: string, silent: boolean = false) => {
    // 如果不是静默删除，需要确认
    if (!silent) {
      const confirmed = window.confirm('确定要删除这篇乐记吗？\n\n删除后将无法恢复！');
      if (!confirmed) return;
    }
    
    // 通过id删除（异步，会同时删除 IndexedDB 中的图片）
    await deleteDiaryFromStorage(id);
    
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
        '当前有未保存的乐记，是否继续当前操作？\n\n'
      );
      
      if (!shouldContinue) {
        // 用户选择不继续，保持当前状态
        return;
      }
    }
    
    // 创建新日记
    resetDiaryState();
    
    // 显示创建新日记提示
    toast.success('已创建新乐记', {
      duration: 2000,
      position: 'top-center',
    });
  };

  // 导出所有乐记（使用筛选后的数据）
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
      
      const message = `确定导出乐记吗？\n\n乐记：${filtered.length} 篇${diaryEntriesSearch.trim() ? `（已筛选）` : ''}`;
      
      if (window.confirm(message)) {
        toast.loading('正在导出数据，请稍候...', { id: 'export-loading' });
        exportDiaryEntriesOnly(filtered).then(() => {
          toast.success('乐记数据导出成功！', { id: 'export-loading' });
        }).catch((error) => {
          toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'), { id: 'export-loading' });
        });
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
      
      const message = `导入完成！\n新增 ${result.imported} 篇乐记，跳过 ${result.skipped} 篇重复记录`;
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

    const validationError = validateMusicImportFile(file);
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
  const handleDeleteAll = async () => {
    try {
      const count = await clearAllDiaryEntries();
      setDiaryEntries([]);
      resetDiaryState();
      toast.success(`已删除 ${count} 篇乐记`);
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
        '当前有未保存的乐记，是否继续当前操作？\n\n'
      );
      
      if (!shouldContinue) {
        // 用户选择不继续，保持当前状态
        return;
      }
    }
    
    // 直接加载点击的日记
    loadDiaryEntry(entry);
  };

  // 筛选歌词
  const filteredQuickNotes = quickNotes
    .filter(note => {
      if (!quickNotesSearch.trim()) return true;
      return note.content.toLowerCase().includes(quickNotesSearch.toLowerCase());
    })
    .sort((a, b) => b.timestamp - a.timestamp); // 按创建日期倒序排序

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
    <div className="music">
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
      
      <MusicLyrics
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
      
      <MusicNotebook
        ref={musicNotebookRef}
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
        currentImage={currentImage}
        onImageChange={setCurrentImage}
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
      
      <MusicList
        diaryEntries={filteredDiaryEntries}
        currentDiaryId={currentDiary?.id || null}
        onLoadDiary={handleLoadDiary}
        onDeleteDiary={handleDeleteDiary}
        onExportAll={handleExportDiaryEntries}
        onImportAll={triggerDiaryEntriesFileSelect}
        onDeleteAll={handleDeleteAll}
        searchContent={diaryEntriesSearch}
        onSearchContentChange={setDiaryEntriesSearch}
        isImporting={isImportingDiaryEntries}
        hasUnsavedChanges={hasUnsavedChanges()}
      />
    </div>
  );
};

export default Music;
