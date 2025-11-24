import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { RecordForm, RecordList, CategoryManager, SleepForm, SleepList, CategoryFilter, DailyRecordForm, DailyRecordList, CardDraw, StudyRecordForm, StudyRecordList, StudyCategoryManager, Fortune, AgeCalculator, Diary, Music, Reading, Medical } from '@/components';
import { ExpenseRecord, IncomeRecord, RecordType, SleepRecord, DailyRecord, StudyRecord, PageMode, PAGE_MODE_LABELS, PAGE_MODE_ICONS, MealStatus } from '@/utils';
import { 
  loadExpenses, addExpense, deleteExpense, updateExpense,
  loadIncomes, addIncome, deleteIncome, updateIncome,
  exportExpensesOnly, exportIncomesOnly, 
  importExpensesOnly, importIncomesOnly, 
  validateImportFile,
  loadSleepRecords, addSleepRecord, deleteSleepRecord, updateSleepRecord,
  exportSleepRecords, importSleepRecords, validateSleepImportFile,
  loadDailyRecords, addDailyRecord, deleteDailyRecord, updateDailyRecord,
  exportDailyRecords, importDailyRecords, validateDailyImportFile, clearAllDailyRecords,
  loadStudyRecords, addStudyRecord, deleteStudyRecord, updateStudyRecord,
  exportStudyRecords, importStudyRecords, validateStudyImportFile, clearAllStudyRecords,
  getCategories, getIncomeCategories, getStudyCategories,
  clearExpensesOnly, clearIncomesOnly, clearAllSleepRecords
} from '@/utils';
import './Home.scss';

const Home: React.FC = () => {
  // 当前页面模式状态（从 URL 参数读取）
  const [currentMode, setCurrentMode] = useState<PageMode>(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const mode = params.get('mode');
    // 统一处理所有模式
    if (mode === 'accounting') return PageMode.ACCOUNTING;
    if (mode === 'sleep') return PageMode.SLEEP;
    if (mode === 'daily') return PageMode.DAILY;
    if (mode === 'software') return PageMode.SOFTWARE;
    if (mode === 'study') return PageMode.STUDY;
    if (mode === 'diary') return PageMode.DIARY;
    if (mode === 'music') return PageMode.MUSIC;
    if (mode === 'reading') return PageMode.READING;
    if (mode === 'medical') return PageMode.MEDICAL;
    // 如果没有mode参数，设置默认值并更新URL
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '#/?mode=accounting';
    }
    return PageMode.ACCOUNTING;
  });
  
  // 记账相关状态
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [isImportingExpense, setIsImportingExpense] = useState(false);
  const [isImportingIncome, setIsImportingIncome] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryManagerType, setCategoryManagerType] = useState<RecordType>(RecordType.EXPENSE);
  const [categoriesKey, setCategoriesKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const expenseFileInputRef = useRef<HTMLInputElement>(null);
  const incomeFileInputRef = useRef<HTMLInputElement>(null);

  // 睡眠记录相关状态
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [editingSleep, setEditingSleep] = useState<SleepRecord | null>(null);
  const [isImportingSleep, setIsImportingSleep] = useState(false);
  const sleepFileInputRef = useRef<HTMLInputElement>(null);

  // 日常记录相关状态
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [editingDaily, setEditingDaily] = useState<DailyRecord | null>(null);
  const [isImportingDaily, setIsImportingDaily] = useState(false);
  const dailyFileInputRef = useRef<HTMLInputElement>(null);

  // 学习记录相关状态
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [editingStudy, setEditingStudy] = useState<StudyRecord | null>(null);
  const [isImportingStudy, setIsImportingStudy] = useState(false);
  const studyFileInputRef = useRef<HTMLInputElement>(null);
  const [showStudyCategoryManager, setShowStudyCategoryManager] = useState(false);
  const [studyCategoriesKey, setStudyCategoriesKey] = useState(0);


  // 分类筛选状态
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);

  // 查询筛选状态 - 支出
  const [expenseMinAmount, setExpenseMinAmount] = useState<number | undefined>(undefined);
  const [expenseMaxAmount, setExpenseMaxAmount] = useState<number | undefined>(undefined);
  const [expenseSearchDescription, setExpenseSearchDescription] = useState<string>('');

  // 查询筛选状态 - 收入
  const [incomeMinAmount, setIncomeMinAmount] = useState<number | undefined>(undefined);
  const [incomeMaxAmount, setIncomeMaxAmount] = useState<number | undefined>(undefined);
  const [incomeSearchDescription, setIncomeSearchDescription] = useState<string>('');

  // 查询筛选状态 - 睡眠记录
  const [sleepMinHour, setSleepMinHour] = useState<number | undefined>(undefined);
  const [sleepMaxHour, setSleepMaxHour] = useState<number | undefined>(undefined);
  const [sleepDurationLevel, setSleepDurationLevel] = useState<'all' | 'too-short' | 'insufficient' | 'normal' | 'excessive'>('all');
  const [sleepQualityLevel, setSleepQualityLevel] = useState<'all' | 'excellent' | 'good' | 'fair' | 'poor'>('all');
  const [sleepSearchNotes, setSleepSearchNotes] = useState<string>('');

  // 查询筛选状态 - 日常记录
  const [dailyMealFilter, setDailyMealFilter] = useState<'all' | 'regular' | 'irregular'>('all');
  const [dailyCheckinFilter, setDailyCheckinFilter] = useState<'all' | 'normal' | 'abnormal'>('all');
  const [dailyHouseworkFilter, setDailyHouseworkFilter] = useState<'all' | 'wash' | 'bath' | 'housework'>('all');
  const [dailyStepsLevel, setDailyStepsLevel] = useState<'all' | 'gold' | 'green' | 'normal' | 'orange' | 'red'>('all');
  const [dailySearchNotes, setDailySearchNotes] = useState<string>('');

  // 查询筛选状态 - 学习记录
  const [studySelectedCategory, setStudySelectedCategory] = useState<string>('全部');
  const [studySearchTitle, setStudySearchTitle] = useState<string>('');
  const [studyMinDurationHours, setStudyMinDurationHours] = useState<number>(0);

  // 初始化分类筛选（默认全选）
  useEffect(() => {
    const expenseCategories = getCategories();
    const incomeCategories = getIncomeCategories();
    setSelectedExpenseCategories(expenseCategories);
    setSelectedIncomeCategories(incomeCategories);
  }, [categoriesKey]); // 当分类变化时重新初始化

  // 获取当前月份字符串 (YYYY-MM)
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // 筛选支出记录（应用分类、金额和备注过滤）
  const filterExpenses = (records: ExpenseRecord[]) => {
    return records.filter(e => {
      // 分类筛选
      if (!selectedExpenseCategories.includes(e.category)) return false;
      
      // 金额筛选
      if (expenseMinAmount !== undefined && e.amount < expenseMinAmount) return false;
      if (expenseMaxAmount !== undefined && e.amount > expenseMaxAmount) return false;
      
      // 备注筛选
      if (expenseSearchDescription && expenseSearchDescription.trim() !== '') {
        const description = e.description || '';
        if (!description.toLowerCase().includes(expenseSearchDescription.toLowerCase().trim())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 筛选收入记录（应用分类、金额和备注过滤）
  const filterIncomes = (records: IncomeRecord[]) => {
    return records.filter(i => {
      // 分类筛选
      if (!selectedIncomeCategories.includes(i.category)) return false;
      
      // 金额筛选
      if (incomeMinAmount !== undefined && i.amount < incomeMinAmount) return false;
      if (incomeMaxAmount !== undefined && i.amount > incomeMaxAmount) return false;
      
      // 备注筛选
      if (incomeSearchDescription && incomeSearchDescription.trim() !== '') {
        const description = i.description || '';
        if (!description.toLowerCase().includes(incomeSearchDescription.toLowerCase().trim())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 筛选睡眠记录（应用睡眠区间、时长、质量和备注过滤）
  const filterSleepRecords = (records: SleepRecord[]) => {
    return records.filter(s => {
      // 睡眠区间筛选（入睡时间的小时数）
      if (sleepMinHour !== undefined || sleepMaxHour !== undefined) {
        const sleepHour = parseInt(s.sleepTime.split(':')[0]);
        if (sleepMinHour !== undefined && sleepHour < sleepMinHour) return false;
        if (sleepMaxHour !== undefined && sleepHour > sleepMaxHour) return false;
      }
      
      // 睡眠时长分类筛选
      if (sleepDurationLevel !== 'all') {
        if (s.duration === undefined) return false;
        const durationHours = s.duration / 60; // 将分钟转换为小时
        if (sleepDurationLevel === 'too-short' && durationHours >= 4) return false;
        if (sleepDurationLevel === 'insufficient' && (durationHours < 4 || durationHours >= 7)) return false;
        if (sleepDurationLevel === 'normal' && (durationHours < 7 || durationHours > 9)) return false;
        if (sleepDurationLevel === 'excessive' && durationHours <= 9) return false;
      }
      
      // 睡眠质量等级筛选
      if (sleepQualityLevel !== 'all') {
        const quality = s.quality;
        if (sleepQualityLevel === 'excellent' && quality < 90) return false;
        if (sleepQualityLevel === 'good' && (quality < 75 || quality >= 90)) return false;
        if (sleepQualityLevel === 'fair' && (quality < 60 || quality >= 75)) return false;
        if (sleepQualityLevel === 'poor' && quality >= 60) return false;
      }
      
      // 备注筛选
      if (sleepSearchNotes && sleepSearchNotes.trim() !== '') {
        const notes = s.notes || '';
        if (!notes.toLowerCase().includes(sleepSearchNotes.toLowerCase().trim())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 筛选日常记录（应用三餐、打卡、内务、步数和备注过滤）
  const filterDailyRecords = (records: DailyRecord[]) => {
    return records.filter(d => {
      // 三餐筛选（只有三个都规律才算规律）
      if (dailyMealFilter !== 'all') {
        const isRegular = 
          d.meals.breakfast === MealStatus.EATEN_REGULAR &&
          d.meals.lunch === MealStatus.EATEN_REGULAR &&
          d.meals.dinner === MealStatus.EATEN_REGULAR;
        
        if (dailyMealFilter === 'regular' && !isRegular) return false;
        if (dailyMealFilter === 'irregular' && isRegular) return false;
      }
      
      // 打卡筛选
      if (dailyCheckinFilter !== 'all') {
        // 判断打卡是否正常
        const isNormal = (() => {
          // 如果都没填，说明不工作，算正常
          if (!d.checkInTime && !d.checkOutTime && !d.leaveTime) {
            return true;
          }
          
          let normal = true;
          
          // 签到时间检查：9点半及以前算正常
          if (d.checkInTime) {
            const checkInHour = parseInt(d.checkInTime.split(':')[0]);
            const checkInMinute = parseInt(d.checkInTime.split(':')[1]);
            const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
            if (checkInTotalMinutes > 9 * 60 + 30) { // 9:30之后算不正常
              normal = false;
            }
          }
          
          // 签退时间检查：6点后算正常
          if (d.checkOutTime) {
            const checkOutHour = parseInt(d.checkOutTime.split(':')[0]);
            const checkOutMinute = parseInt(d.checkOutTime.split(':')[1]);
            const checkOutTotalMinutes = checkOutHour * 60 + checkOutMinute;
            if (checkOutTotalMinutes < 18 * 60) {
              normal = false;
            }
          }
          
          // 离开时间检查：10点后算正常
          if (d.leaveTime) {
            const leaveHour = parseInt(d.leaveTime.split(':')[0]);
            const leaveMinute = parseInt(d.leaveTime.split(':')[1]);
            const leaveTotalMinutes = leaveHour * 60 + leaveMinute;
            if (leaveTotalMinutes < 22 * 60) {
              normal = false;
            }
          }
          
          return normal;
        })();
        
        if (dailyCheckinFilter === 'normal' && !isNormal) return false;
        if (dailyCheckinFilter === 'abnormal' && isNormal) return false;
      }
      
      // 内务筛选
      if (dailyHouseworkFilter !== 'all') {
        if (dailyHouseworkFilter === 'wash') {
          // 洗漱：早洗或晚洗
          if (!d.hygiene.morningWash && !d.hygiene.nightWash) return false;
        } else if (dailyHouseworkFilter === 'bath') {
          // 洗浴：洗澡、洗头、洗脚或洗脸
          if (!d.bathing.shower && !d.bathing.hairWash && !d.bathing.footWash && !d.bathing.faceWash) return false;
        } else if (dailyHouseworkFilter === 'housework') {
          // 家务：洗衣或打扫
          if (!d.laundry && !d.cleaning) return false;
        }
      }
      
      // 步数等级筛选
      if (dailyStepsLevel !== 'all') {
        if (d.wechatSteps === undefined) return false;
        const steps = d.wechatSteps;
        
        if (dailyStepsLevel === 'gold' && steps < 25000) return false;
        if (dailyStepsLevel === 'green' && (steps < 10000 || steps >= 25000)) return false;
        if (dailyStepsLevel === 'normal' && (steps < 5000 || steps >= 10000)) return false;
        if (dailyStepsLevel === 'orange' && (steps < 2000 || steps >= 5000)) return false;
        if (dailyStepsLevel === 'red' && steps >= 2000) return false;
      }
      
      // 备注筛选
      if (dailySearchNotes && dailySearchNotes.trim() !== '') {
        const notes = d.notes || '';
        if (!notes.toLowerCase().includes(dailySearchNotes.toLowerCase().trim())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 筛选学习记录（应用分类、标题和时长过滤）
  const filterStudyRecords = (records: StudyRecord[]) => {
    return records.filter(s => {
      // 分类筛选
      if (studySelectedCategory !== '全部' && s.category !== studySelectedCategory) {
        return false;
      }
      
      // 标题搜索
      if (studySearchTitle && studySearchTitle.trim() !== '') {
        const title = s.videoTitle || '';
        if (!title.toLowerCase().includes(studySearchTitle.toLowerCase().trim())) {
          return false;
        }
      }
      
      // 时长筛选（大于等于指定小时数）
      if (studyMinDurationHours > 0) {
        const durationHours = s.totalTime / 60; // 将分钟转换为小时
        if (durationHours < studyMinDurationHours) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 计算本月支出
  const getMonthlyExpenses = () => {
    const currentMonth = getCurrentMonth();
    return filterExpenses(expenses)
      .filter(e => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 计算本月收入
  const getMonthlyIncomes = () => {
    const currentMonth = getCurrentMonth();
    return filterIncomes(incomes)
      .filter(i => i.date.startsWith(currentMonth))
      .reduce((sum, i) => sum + i.amount, 0);
  };

  // 加载存储的支出和收入记录
  const loadData = () => {
    const savedExpenses = loadExpenses();
    const savedIncomes = loadIncomes();
    const savedSleeps = loadSleepRecords();
    const savedDailyRecords = loadDailyRecords();
    const savedStudyRecords = loadStudyRecords();
    setExpenses(savedExpenses);
    setIncomes(savedIncomes);
    setSleepRecords(savedSleeps);
    setDailyRecords(savedDailyRecords);
    setStudyRecords(savedStudyRecords);
  };

  useEffect(() => {
    loadData();
    
    // 监听URL hash变化，同步页面模式
    const handleHashChange = () => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const mode = params.get('mode');
      const page = params.get('page'); // 兼容旧的page参数
      
      // 统一处理mode参数
      if (mode === 'accounting') {
        setCurrentMode(PageMode.ACCOUNTING);
      } else if (mode === 'sleep') {
        setCurrentMode(PageMode.SLEEP);
      } else if (mode === 'daily') {
        setCurrentMode(PageMode.DAILY);
      } else if (mode === 'software') {
        setCurrentMode(PageMode.SOFTWARE);
      } else if (mode === 'study') {
        setCurrentMode(PageMode.STUDY);
      } else if (mode === 'diary') {
        setCurrentMode(PageMode.DIARY);
      } else if (mode === 'music') {
        setCurrentMode(PageMode.MUSIC);
      } else if (mode === 'reading') {
        setCurrentMode(PageMode.READING);
      } else if (mode === 'medical') {
        setCurrentMode(PageMode.MEDICAL);
      }
      
      // 兼容旧的page参数
      if (page === 'diary') {
        setCurrentMode(PageMode.DIARY);
      } else if (page === 'music') {
        setCurrentMode(PageMode.MUSIC);
      } else if (page === 'reading') {
        setCurrentMode(PageMode.READING);
      } else if (page === 'medical') {
        setCurrentMode(PageMode.MEDICAL);
      }
      
      // 如果既没有mode也没有page,默认显示记账
      if (!mode && !page) {
        setCurrentMode(PageMode.ACCOUNTING);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 添加新收入
  const handleAddIncome = (income: IncomeRecord) => {
    addIncome(income);
    const updatedIncomes = loadIncomes();
    setIncomes(updatedIncomes);
    toast.success('收入记录添加成功！');
  };

  // 删除收入
  const handleDeleteIncome = (id: string) => {
    if (window.confirm('确定要删除这条收入记录吗？')) {
      deleteIncome(id);
      const updatedIncomes = loadIncomes();
      setIncomes(updatedIncomes);
      toast.success('收入记录删除成功！');
    }
  };

  // 编辑收入
  const handleEditIncome = (income: IncomeRecord) => {
    setEditingIncome(income);
    setEditingExpense(null); // 清除支出编辑状态
  };

  // 更新收入
  const handleUpdateIncome = (updatedIncome: IncomeRecord) => {
    updateIncome(updatedIncome);
    const updatedIncomes = loadIncomes();
    setIncomes(updatedIncomes);
    setEditingIncome(null);
    toast.success('收入记录更新成功！');
  };

  // 添加新支出
  const handleAddExpense = (expense: ExpenseRecord) => {
    addExpense(expense);
    setExpenses(prev => [...prev, expense]);
    toast.success('支出记录添加成功！');
  };

  // 删除支出记录
  const handleDeleteExpense = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('支出记录删除成功！');
    }
  };

  // 跳转到支出数据看板页面
  const goToExpenseDashboard = () => {
    window.location.hash = '#/dashboard?tab=records&type=expense';
  };

  // 跳转到收入数据看板页面
  const goToIncomeDashboard = () => {
    window.location.hash = '#/dashboard?tab=records&type=income';
  };

  // 跳转到睡眠数据面板页面
  const goToSleepDashboard = () => {
    window.location.hash = '#/dashboard?tab=sleep';
  };

  // 跳转到日常数据面板页面
  const goToDailyDashboard = () => {
    window.location.hash = '#/dashboard?tab=daily';
  };

  // === 支出相关操作 ===
  
  // 处理支出导出
  const handleExportExpenses = () => {
    try {
      const filteredExpenses = filterExpenses(expenses);
      
      const message = `确定导出支出记录吗？\n\n支出记录：${filteredExpenses.length} 条`;
      
      if (window.confirm(message)) {
        exportExpensesOnly(filteredExpenses);
        toast.success('支出数据导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理支出导入
  const handleImportExpenses = async (file: File) => {
    setIsImportingExpense(true);
    try {
      const result = await importExpensesOnly(file);
      loadData(); // 重新加载数据
      setCategoriesKey(prev => prev + 1); // 触发分类重新加载
      
      const message = `导入完成！\n新增 ${result.imported} 条支出记录，跳过 ${result.skipped} 条重复记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingExpense(false);
      if (expenseFileInputRef.current) {
        expenseFileInputRef.current.value = '';
      }
    }
  };

  // 处理支出文件选择
  const handleExpenseFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportExpenses(file);
  };

  // 触发支出文件选择
  const triggerExpenseFileSelect = () => {
    expenseFileInputRef.current?.click();
  };

  // 清空支出数据
  const handleClearExpenses = () => {
    const message = `⚠️ 警告：此操作将清空所有支出数据！\n\n当前支出记录：${expenses.length} 条\n\n此操作不可恢复，确定要清空吗？`;
    
    if (window.confirm(message)) {
      const count = clearExpensesOnly();
      loadData();
      toast.success(`已清空 ${count} 条支出记录！`);
    }
  };

  // === 收入相关操作 ===
  
  // 处理收入导出
  const handleExportIncomes = () => {
    try {
      const filteredIncomes = filterIncomes(incomes);
      
      const message = `确定导出收入记录吗？\n\n收入记录：${filteredIncomes.length} 条`;
      
      if (window.confirm(message)) {
        exportIncomesOnly(filteredIncomes);
        toast.success('收入数据导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理收入导入
  const handleImportIncomes = async (file: File) => {
    setIsImportingIncome(true);
    try {
      const result = await importIncomesOnly(file);
      loadData(); // 重新加载数据
      setCategoriesKey(prev => prev + 1); // 触发分类重新加载
      
      const message = `导入完成！\n新增 ${result.imported} 条收入记录，跳过 ${result.skipped} 条重复记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingIncome(false);
      if (incomeFileInputRef.current) {
        incomeFileInputRef.current.value = '';
      }
    }
  };

  // 处理收入文件选择
  const handleIncomeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportIncomes(file);
  };

  // 触发收入文件选择
  const triggerIncomeFileSelect = () => {
    incomeFileInputRef.current?.click();
  };

  // 清空收入数据
  const handleClearIncomes = () => {
    const message = `⚠️ 警告：此操作将清空所有收入数据！\n\n当前收入记录：${incomes.length} 条\n\n此操作不可恢复，确定要清空吗？`;
    
    if (window.confirm(message)) {
      const count = clearIncomesOnly();
      loadData();
      toast.success(`已清空 ${count} 条收入记录！`);
    }
  };

  // 打开分类管理器
  const handleOpenCategoryManager = (type: RecordType = RecordType.EXPENSE) => {
    setCategoryManagerType(type);
    setShowCategoryManager(true);
  };

  // 关闭分类管理器
  const handleCloseCategoryManager = () => {
    setShowCategoryManager(false);
  };

  // 打开学习分类管理器
  const handleOpenStudyCategoryManager = () => {
    setShowStudyCategoryManager(true);
  };

  // 关闭学习分类管理器
  const handleCloseStudyCategoryManager = () => {
    setShowStudyCategoryManager(false);
  };

  // 学习分类变化时刷新
  const handleStudyCategoriesChange = () => {
    setStudyCategoriesKey(prev => prev + 1);
    // 重新加载学习记录
    const updatedStudyRecords = loadStudyRecords();
    setStudyRecords(updatedStudyRecords);
    
    // 如果正在编辑记录，需要同步更新编辑状态中的数据
    if (editingStudy) {
      const updatedRecord = updatedStudyRecords.find(r => r.id === editingStudy.id);
      if (updatedRecord) {
        setEditingStudy(updatedRecord);
      }
    }
  };

  // 分类变化时刷新
  const handleCategoriesChange = () => {
    setCategoriesKey(prev => prev + 1);
    // 重新加载数据，确保分类修改后的记录能正确显示
    const updatedExpenses = loadExpenses();
    const updatedIncomes = loadIncomes();
    setExpenses(updatedExpenses);
    setIncomes(updatedIncomes);
    
    // 如果正在编辑记录，需要同步更新编辑状态中的数据
    if (editingExpense) {
      const updatedEditingExpense = updatedExpenses.find(e => e.id === editingExpense.id);
      if (updatedEditingExpense) {
        setEditingExpense(updatedEditingExpense);
      }
    }
    
    if (editingIncome) {
      const updatedEditingIncome = updatedIncomes.find(i => i.id === editingIncome.id);
      if (updatedEditingIncome) {
        setEditingIncome(updatedEditingIncome);
      }
    }
  };

  // 开始编辑支出记录
  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setEditingIncome(null); // 清除收入编辑状态
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setEditingIncome(null);
  };

  // 更新支出记录
  const handleUpdateExpense = (updatedExpense: ExpenseRecord) => {
    // 这里需要创建一个更新函数
    updateExpense(updatedExpense);
    setExpenses(prev => prev.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
    setEditingExpense(null);
    toast.success('支出记录更新成功！');
  };

  // === 睡眠记录相关处理函数 ===
  
  // 添加睡眠记录
  const handleAddSleep = (sleep: SleepRecord) => {
    addSleepRecord(sleep);
    const updatedSleeps = loadSleepRecords();
    setSleepRecords(updatedSleeps);
    toast.success('睡眠记录添加成功！');
  };

  // 删除睡眠记录
  const handleDeleteSleep = (id: string) => {
    if (window.confirm('确定要删除这条睡眠记录吗？')) {
      deleteSleepRecord(id);
      const updatedSleeps = loadSleepRecords();
      setSleepRecords(updatedSleeps);
      toast.success('睡眠记录删除成功！');
    }
  };

  // 编辑睡眠记录
  const handleEditSleep = (sleep: SleepRecord) => {
    setEditingSleep(sleep);
  };

  // 更新睡眠记录
  const handleUpdateSleep = (updatedSleep: SleepRecord) => {
    updateSleepRecord(updatedSleep);
    const updatedSleeps = loadSleepRecords();
    setSleepRecords(updatedSleeps);
    setEditingSleep(null);
    toast.success('睡眠记录更新成功！');
  };

  // 取消编辑睡眠记录
  const handleCancelSleepEdit = () => {
    setEditingSleep(null);
  };

  // 切换页面模式
  const handleModeChange = (mode: PageMode) => {
    setCurrentMode(mode);
    // 更新URL，统一使用mode参数
    const modeParam = mode === PageMode.ACCOUNTING ? 'accounting'
                    : mode === PageMode.SLEEP ? 'sleep'
                    : mode === PageMode.DAILY ? 'daily'
                    : mode === PageMode.SOFTWARE ? 'software'
                    : mode === PageMode.STUDY ? 'study'
                    : mode === PageMode.DIARY ? 'diary'
                    : mode === PageMode.MUSIC ? 'music'
                    : mode === PageMode.READING ? 'reading'
                    : 'medical';
    window.location.hash = `#/?mode=${modeParam}`;
  };

  // === 清除数据功能 ===
  
  // === 清除记账数据功能已移到各自的CategoryFilter中 ===
  
  // 清除睡眠记录
  const handleClearSleepData = () => {
    const message = `⚠️ 警告：此操作将清空所有睡眠记录！\n\n当前数据：\n• 睡眠记录：${sleepRecords.length} 条\n\n此操作不可恢复，确定要清空吗？`;
    
    if (window.confirm(message)) {
      const count = clearAllSleepRecords();
      loadData(); // 重新加载数据
      toast.success(`已清空 ${count} 条睡眠记录！`);
    }
  };

  // === 睡眠记录导入导出功能 ===

  // 导出睡眠记录
  const handleExportSleep = () => {
    try {
      const filteredRecords = filterSleepRecords(sleepRecords);
      const message = `确定导出睡眠记录吗？\n\n筛选后的记录：${filteredRecords.length} 条`;
      
      if (window.confirm(message)) {
        exportSleepRecords(filteredRecords);
        toast.success('睡眠记录导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入睡眠记录
  const handleImportSleep = async (file: File) => {
    setIsImportingSleep(true);
    try {
      const result = await importSleepRecords(file);
      loadData(); // 重新加载数据

      const message = `导入完成！\n新增 ${result.imported} 条记录，跳过 ${result.skipped} 条重复记录\n总计 ${result.total} 条记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingSleep(false);
      // 清空文件输入
      if (sleepFileInputRef.current) {
        sleepFileInputRef.current.value = '';
      }
    }
  };

  // 处理睡眠记录文件选择
  const handleSleepFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateSleepImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportSleep(file);
  };

  // 触发睡眠记录文件选择
  const triggerSleepFileSelect = () => {
    sleepFileInputRef.current?.click();
  };

  // === 日常记录处理函数 ===

  // 添加日常记录
  const handleAddDaily = (record: DailyRecord) => {
    addDailyRecord(record);
    const updatedRecords = loadDailyRecords();
    setDailyRecords(updatedRecords);
    toast.success('日常记录添加成功！');
  };

  // 删除日常记录
  const handleDeleteDaily = (id: string) => {
    if (window.confirm('确定要删除这条日常记录吗？')) {
      deleteDailyRecord(id);
      const updatedRecords = loadDailyRecords();
      setDailyRecords(updatedRecords);
      toast.success('日常记录删除成功！');
    }
  };

  // 编辑日常记录
  const handleEditDaily = (record: DailyRecord) => {
    setEditingDaily(record);
  };

  // 更新日常记录
  const handleUpdateDaily = (updatedRecord: DailyRecord) => {
    updateDailyRecord(updatedRecord);
    const updatedRecords = loadDailyRecords();
    setDailyRecords(updatedRecords);
    setEditingDaily(null);
    toast.success('日常记录更新成功！');
  };

  // 取消编辑日常记录
  const handleCancelDailyEdit = () => {
    setEditingDaily(null);
  };

  // 导出日常记录
  const handleExportDaily = () => {
    try {
      const filteredRecords = filterDailyRecords(dailyRecords);
      const message = `确定导出日常记录吗？\n\n筛选后的记录：${filteredRecords.length} 条`;

      if (window.confirm(message)) {
        exportDailyRecords(filteredRecords);
        toast.success('日常记录导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入日常记录
  const handleImportDaily = async (file: File) => {
    setIsImportingDaily(true);
    try {
      const result = await importDailyRecords(file);
      loadData(); // 重新加载数据

      const message = `导入完成！\n新增 ${result.imported} 条记录，跳过 ${result.skipped} 条重复记录\n总计 ${result.total} 条记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingDaily(false);
      if (dailyFileInputRef.current) {
        dailyFileInputRef.current.value = '';
      }
    }
  };

  // 处理日常记录文件选择
  const handleDailyFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateDailyImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportDaily(file);
  };

  // 触发日常记录文件选择
  const triggerDailyFileSelect = () => {
    dailyFileInputRef.current?.click();
  };

  // 清空日常记录
  const handleClearDailyData = () => {
    const message = `⚠️ 警告：此操作将清空所有日常记录！\n\n当前记录：${dailyRecords.length} 条\n\n此操作不可恢复，确定要清空吗？`;

    if (window.confirm(message)) {
      const count = clearAllDailyRecords();
      loadData();
      toast.success(`已清空 ${count} 条日常记录！`);
    }
  };

  // === 学习记录处理函数 ===

  // 添加学习记录
  const handleAddStudy = (record: StudyRecord) => {
    addStudyRecord(record);
    const updatedRecords = loadStudyRecords();
    setStudyRecords(updatedRecords);
    toast.success('学习记录添加成功！');
  };

  // 删除学习记录
  const handleDeleteStudy = (id: string) => {
    if (window.confirm('确定要删除这条学习记录吗？')) {
      deleteStudyRecord(id);
      const updatedRecords = loadStudyRecords();
      setStudyRecords(updatedRecords);
      toast.success('学习记录删除成功！');
    }
  };

  // 编辑学习记录
  const handleEditStudy = (record: StudyRecord) => {
    setEditingStudy(record);
  };

  // 更新学习记录
  const handleUpdateStudy = (updatedRecord: StudyRecord) => {
    updateStudyRecord(updatedRecord);
    const updatedRecords = loadStudyRecords();
    setStudyRecords(updatedRecords);
    setEditingStudy(null);
    toast.success('学习记录更新成功！');
  };

  // 取消编辑学习记录
  const handleCancelStudyEdit = () => {
    setEditingStudy(null);
  };

  // 导出学习记录
  const handleExportStudy = () => {
    try {
      const filteredRecords = filterStudyRecords(studyRecords);
      const message = `确定导出学习记录吗？\n\n筛选后的记录：${filteredRecords.length} 条`;

      if (window.confirm(message)) {
        exportStudyRecords(filteredRecords);
        toast.success('学习记录导出成功！');
      }
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入学习记录
  const handleImportStudy = async (file: File) => {
    setIsImportingStudy(true);
    try {
      const result = await importStudyRecords(file);
      loadData(); // 重新加载数据
      setStudyCategoriesKey(prev => prev + 1); // 触发分类重新加载

      const message = `导入完成！\n新增 ${result.imported} 条记录，跳过 ${result.skipped} 条重复记录\n总计 ${result.total} 条记录`;
      toast.success(message);
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingStudy(false);
      if (studyFileInputRef.current) {
        studyFileInputRef.current.value = '';
      }
    }
  };

  // 处理学习记录文件选择
  const handleStudyFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateStudyImportFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    handleImportStudy(file);
  };

  // 触发学习记录文件选择
  const triggerStudyFileSelect = () => {
    studyFileInputRef.current?.click();
  };

  // 清空学习记录
  const handleClearStudyData = () => {
    const message = `⚠️ 警告：此操作将清空所有学习记录！\n\n当前记录：${studyRecords.length} 条\n\n此操作不可恢复，确定要清空吗？`;

    if (window.confirm(message)) {
      const count = clearAllStudyRecords();
      loadData();
      toast.success(`已清空 ${count} 条学习记录！`);
    }
  };

  return (
    <div className="home">
      <header className="home__header">
        {/* 统一的tab切换容器 */}
        <div className="home__tabs-container">
          {/* 页面模式切换按钮（两行布局） */}
          <div className="home__mode-switcher">
            {/* 第一行:业务模式按钮 */}
            <button 
              className={`mode-btn ${currentMode === PageMode.ACCOUNTING ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.ACCOUNTING)}
            >
              {PAGE_MODE_ICONS[PageMode.ACCOUNTING]} {PAGE_MODE_LABELS[PageMode.ACCOUNTING]}
            </button>
            <button 
              className={`mode-btn ${currentMode === PageMode.SLEEP ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.SLEEP)}
            >
              {PAGE_MODE_ICONS[PageMode.SLEEP]} {PAGE_MODE_LABELS[PageMode.SLEEP]}
            </button>
            <button 
              className={`mode-btn ${currentMode === PageMode.STUDY ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.STUDY)}
            >
              {PAGE_MODE_ICONS[PageMode.STUDY]} {PAGE_MODE_LABELS[PageMode.STUDY]}
            </button>
            <button 
              className={`mode-btn ${currentMode === PageMode.DAILY ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.DAILY)}
            >
              {PAGE_MODE_ICONS[PageMode.DAILY]} {PAGE_MODE_LABELS[PageMode.DAILY]}
            </button>

            {/* 第二行：占位空格 + 健康管理按钮 */}
            <div className="settings-btn-placeholder"></div>
            <button 
              className={`mode-btn health-btn ${currentMode === PageMode.DIARY ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.DIARY)}
            >
              {PAGE_MODE_ICONS[PageMode.DIARY]} {PAGE_MODE_LABELS[PageMode.DIARY]}
            </button>
            <button 
              className={`mode-btn health-btn ${currentMode === PageMode.MUSIC ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.MUSIC)}
            >
              {PAGE_MODE_ICONS[PageMode.MUSIC]} {PAGE_MODE_LABELS[PageMode.MUSIC]}
            </button>
            <button 
              className={`mode-btn health-btn ${currentMode === PageMode.READING ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.READING)}
            >
              {PAGE_MODE_ICONS[PageMode.READING]} {PAGE_MODE_LABELS[PageMode.READING]}
            </button>
            <button 
              className={`mode-btn health-btn ${currentMode === PageMode.MEDICAL ? 'mode-btn--active' : ''}`}
              onClick={() => handleModeChange(PageMode.MEDICAL)}
            >
              {PAGE_MODE_ICONS[PageMode.MEDICAL]} {PAGE_MODE_LABELS[PageMode.MEDICAL]}
            </button>
          </div>
        </div>

        {/* 根据当前模式显示标题 */}
        {currentMode === PageMode.ACCOUNTING ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.ACCOUNTING]} {PAGE_MODE_LABELS[PageMode.ACCOUNTING]}</h1>
            <p>记录你的每一笔收支</p>
          </>
        ) : currentMode === PageMode.SLEEP ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.SLEEP]} {PAGE_MODE_LABELS[PageMode.SLEEP]}</h1>
            <p>记录你的每一次睡眠</p>
          </>
        ) : currentMode === PageMode.SOFTWARE ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.SOFTWARE]} {PAGE_MODE_LABELS[PageMode.SOFTWARE]}</h1>
            <p>记录和分析你的软件使用情况</p>
          </>
        ) : currentMode === PageMode.DAILY ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.DAILY]} {PAGE_MODE_LABELS[PageMode.DAILY]}</h1>
            <p>记录你的日常生活习惯</p>
          </>
        ) : currentMode === PageMode.STUDY ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.STUDY]} {PAGE_MODE_LABELS[PageMode.STUDY]}</h1>
            <p>记录你的学习历程</p>
          </>
        ) : currentMode === PageMode.DIARY ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.DIARY]} {PAGE_MODE_LABELS[PageMode.DIARY]}</h1>
            <p>记录生活点滴，留下美好回忆</p>
          </>
        ) : currentMode === PageMode.MUSIC ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.MUSIC]} {PAGE_MODE_LABELS[PageMode.MUSIC]}</h1>
            <p>记录聆听时光，感受音乐魅力</p>
          </>
        ) : currentMode === PageMode.READING ? (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.READING]} {PAGE_MODE_LABELS[PageMode.READING]}</h1>
            <p>记录阅读历程，积累知识财富</p>
          </>
        ) : (
          <>
            <h1>{PAGE_MODE_ICONS[PageMode.MEDICAL]} {PAGE_MODE_LABELS[PageMode.MEDICAL]}</h1>
            <p>健康管理，关爱自己</p>
          </>
        )}

        {/* 抽卡和算命游戏 - 在header右侧 */}
        <div className="home__games">
          <CardDraw />
          <Fortune />
          <AgeCalculator />
        </div>
      </header>

      <main className="home__main">
        <div className="home__container">
          {/* 根据当前模式渲染不同的内容 */}
          {currentMode === PageMode.ACCOUNTING ? (
            <>
              {/* 隐藏的文件输入 */}
              <input
                ref={expenseFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleExpenseFileSelect}
                style={{ display: 'none' }}
              />
              <input
                ref={incomeFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleIncomeFileSelect}
                style={{ display: 'none' }}
              />
              
              <div className="home__section-group">
                {/* 记录列表 */}
                <div className="home__list-section">
                  <div className="records-container">
                    {/* 支出记录列表 */}
                    <div className="expense-list-container">
                      <CategoryFilter
                        title="支出记录"
                        categories={getCategories()}
                        selectedCategories={selectedExpenseCategories}
                        onCategoryChange={setSelectedExpenseCategories}
                        monthlyAmount={getMonthlyExpenses()}
                        monthlyTotalAmount={expenses.filter(e => e.date.startsWith(getCurrentMonth())).reduce((sum, e) => sum + e.amount, 0)}
                        totalAmount={filterExpenses(expenses).reduce((sum, e) => sum + e.amount, 0)}
                        allTotalAmount={expenses.reduce((sum, e) => sum + e.amount, 0)}
                        onViewDashboard={goToExpenseDashboard}
                        onExport={handleExportExpenses}
                        onImport={triggerExpenseFileSelect}
                        onClear={handleClearExpenses}
                        isImporting={isImportingExpense}
                        minAmount={expenseMinAmount}
                        maxAmount={expenseMaxAmount}
                        searchDescription={expenseSearchDescription}
                        onMinAmountChange={setExpenseMinAmount}
                        onMaxAmountChange={setExpenseMaxAmount}
                        onSearchDescriptionChange={setExpenseSearchDescription}
                      />
                      <RecordList 
                        records={filterExpenses(expenses)} 
                        allRecords={expenses}
                        onDeleteRecord={handleDeleteExpense}
                        onEditRecord={handleEditExpense}
                        type="expense"
                      />
                    </div>
                    
                    {/* 添加支出表单 */}
                    <div className="form-container">
                      <RecordForm
                        onAddExpense={handleAddExpense}
                        onAddIncome={handleAddIncome}
                        onUpdateExpense={handleUpdateExpense}
                        onUpdateIncome={handleUpdateIncome}
                        onOpenCategoryManager={handleOpenCategoryManager}
                        onCancelEdit={handleCancelEdit}
                        categoriesKey={categoriesKey}
                        editingExpense={editingExpense}
                        editingIncome={editingIncome}
                      />
                    </div>
                    
                    {/* 收入记录列表 */}
                    <div className="income-list-container">
                      <CategoryFilter
                        title="收入记录"
                        theme="income"
                        categories={getIncomeCategories()}
                        selectedCategories={selectedIncomeCategories}
                        onCategoryChange={setSelectedIncomeCategories}
                        monthlyAmount={getMonthlyIncomes()}
                        monthlyTotalAmount={incomes.filter(i => i.date.startsWith(getCurrentMonth())).reduce((sum, i) => sum + i.amount, 0)}
                        totalAmount={filterIncomes(incomes).reduce((sum, i) => sum + i.amount, 0)}
                        allTotalAmount={incomes.reduce((sum, i) => sum + i.amount, 0)}
                        onViewDashboard={goToIncomeDashboard}
                        onExport={handleExportIncomes}
                        onImport={triggerIncomeFileSelect}
                        onClear={handleClearIncomes}
                        isImporting={isImportingIncome}
                        minAmount={incomeMinAmount}
                        maxAmount={incomeMaxAmount}
                        searchDescription={incomeSearchDescription}
                        onMinAmountChange={setIncomeMinAmount}
                        onMaxAmountChange={setIncomeMaxAmount}
                        onSearchDescriptionChange={setIncomeSearchDescription}
                      />
                      <RecordList 
                        records={filterIncomes(incomes)} 
                        allRecords={incomes}
                        onDeleteRecord={handleDeleteIncome}
                        onEditRecord={handleEditIncome}
                        type="income"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : currentMode === PageMode.SLEEP ? (
            <>
              {/* 睡眠记录模式 */}
              {/* 隐藏的文件输入 */}
              <input
                ref={sleepFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleSleepFileSelect}
                style={{ display: 'none' }}
              />

              <div className="home__section-group">
                {/* 添加睡眠记录表单 */}
                <div className="home__form-section">
                  <SleepForm
                    onAddSleep={handleAddSleep}
                    onUpdateSleep={handleUpdateSleep}
                    onCancelEdit={handleCancelSleepEdit}
                    editingSleep={editingSleep}
                  />
                </div>

                {/* 睡眠记录列表 */}
                <div className="home__list-section">
                  <div className="sleep-records-container">
                    <SleepList 
                      sleeps={filterSleepRecords(sleepRecords)} 
                      allSleeps={sleepRecords}
                      onDeleteSleep={handleDeleteSleep}
                      onEditSleep={handleEditSleep}
                      onViewDashboard={goToSleepDashboard}
                      onExport={handleExportSleep}
                      onImport={triggerSleepFileSelect}
                      onClear={handleClearSleepData}
                      isImporting={isImportingSleep}
                      minSleepHour={sleepMinHour}
                      maxSleepHour={sleepMaxHour}
                      durationLevel={sleepDurationLevel}
                      qualityLevel={sleepQualityLevel}
                      searchNotes={sleepSearchNotes}
                      onMinSleepHourChange={setSleepMinHour}
                      onMaxSleepHourChange={setSleepMaxHour}
                      onDurationLevelChange={setSleepDurationLevel}
                      onQualityLevelChange={setSleepQualityLevel}
                      onSearchNotesChange={setSleepSearchNotes}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : currentMode === PageMode.DAILY ? (
            <>
              {/* 日常记录模式 */}
              {/* 隐藏的文件输入 */}
              <input
                ref={dailyFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleDailyFileSelect}
                style={{ display: 'none' }}
              />

              <div className="home__section-group">
                {/* 添加日常记录表单 */}
                <div className="home__form-section home__form-section--daily">
                  <DailyRecordForm
                    onAddRecord={handleAddDaily}
                    onUpdateRecord={handleUpdateDaily}
                    onCancelEdit={handleCancelDailyEdit}
                    editingRecord={editingDaily}
                  />
                </div>

                {/* 日常记录列表 */}
                <div className="home__list-section">
                  <div className="daily-records-container">
                    <DailyRecordList 
                      records={filterDailyRecords(dailyRecords)} 
                      allRecords={dailyRecords}
                      onDeleteRecord={handleDeleteDaily}
                      onEditRecord={handleEditDaily}
                      onViewDashboard={goToDailyDashboard}
                      onExport={handleExportDaily}
                      onImport={triggerDailyFileSelect}
                      onClear={handleClearDailyData}
                      isImporting={isImportingDaily}
                      mealFilter={dailyMealFilter}
                      checkinFilter={dailyCheckinFilter}
                      houseworkFilter={dailyHouseworkFilter}
                      stepsLevel={dailyStepsLevel}
                      searchNotes={dailySearchNotes}
                      onMealFilterChange={setDailyMealFilter}
                      onCheckinFilterChange={setDailyCheckinFilter}
                      onHouseworkFilterChange={setDailyHouseworkFilter}
                      onStepsLevelChange={setDailyStepsLevel}
                      onSearchNotesChange={setDailySearchNotes}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : currentMode === PageMode.STUDY ? (
            <>
              {/* 学习记录模式 */}
              {/* 隐藏的文件输入 */}
              <input
                ref={studyFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleStudyFileSelect}
                style={{ display: 'none' }}
              />

              <div className="home__section-group">
                {/* 添加学习记录表单 */}
                <div className="home__form-section home__form-section--daily">
                  <StudyRecordForm
                    onAddRecord={handleAddStudy}
                    onUpdateRecord={handleUpdateStudy}
                    onCancelEdit={handleCancelStudyEdit}
                    onOpenCategoryManager={handleOpenStudyCategoryManager}
                    editingRecord={editingStudy}
                    categoriesKey={studyCategoriesKey}
                  />
                </div>

                {/* 学习记录列表 */}
                <div className="home__list-section">
                  <div className="study-records-container">
                    <StudyRecordList 
                      records={filterStudyRecords(studyRecords)} 
                      allRecords={studyRecords}
                      onDeleteRecord={handleDeleteStudy}
                      onEditRecord={handleEditStudy}
                      onExport={handleExportStudy}
                      onImport={triggerStudyFileSelect}
                      onClear={handleClearStudyData}
                      isImporting={isImportingStudy}
                      categories={getStudyCategories()}
                      selectedCategory={studySelectedCategory}
                      searchTitle={studySearchTitle}
                      minDurationHours={studyMinDurationHours}
                      onCategoryChange={setStudySelectedCategory}
                      onSearchTitleChange={setStudySearchTitle}
                      onMinDurationHoursChange={setStudyMinDurationHours}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : currentMode === PageMode.DIARY ? (
            <div className="home__content-section">
              <Diary />
            </div>
          ) : currentMode === PageMode.MUSIC ? (
            <div className="home__content-section">
              <Music />
            </div>
          ) : currentMode === PageMode.READING ? (
            <div className="home__content-section">
              <Reading />
            </div>
          ) : (
            <div className="home__content-section">
              <Medical />
            </div>
          )}
        </div>
      </main>

      {/* 分类管理器模态框 */}
      {showCategoryManager && (
        <CategoryManager
          recordType={categoryManagerType}
          onClose={handleCloseCategoryManager}
          onCategoriesChange={handleCategoriesChange}
        />
      )}

      {/* 学习分类管理器模态框 */}
      {showStudyCategoryManager && (
        <StudyCategoryManager
          onClose={handleCloseStudyCategoryManager}
          onCategoriesChange={handleStudyCategoriesChange}
        />
      )}
    </div>
  );
};

export default Home;