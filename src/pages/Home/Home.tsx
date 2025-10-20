import React, { useState, useEffect, useRef } from 'react';
import { RecordForm, RecordList, CategoryManager, SleepForm, SleepList, CategoryFilter } from '@/components';
import { ExpenseRecord, IncomeRecord, RecordType, SleepRecord, BusinessMode, BUSINESS_MODE_LABELS } from '@/types';
import { 
  loadExpenses, addExpense, deleteExpense, updateExpense,
  loadIncomes, addIncome, deleteIncome, updateIncome,
  exportExpensesOnly, exportIncomesOnly, 
  importExpensesOnly, importIncomesOnly, 
  validateImportFile,
  loadSleepRecords, addSleepRecord, deleteSleepRecord, updateSleepRecord,
  exportSleepRecords, importSleepRecords, validateSleepImportFile,
  getCategories, getIncomeCategories,
  clearExpensesOnly, clearIncomesOnly, clearAllSleepRecords
} from '@/utils';
import './Home.scss';

const Home: React.FC = () => {
  // 业务模式状态（从 URL 参数读取）
  const [businessMode, setBusinessMode] = useState<BusinessMode>(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const mode = params.get('mode');
    return mode === 'sleep' ? BusinessMode.SLEEP : BusinessMode.ACCOUNTING;
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

  // 分类筛选状态
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);

  // 初始化分类筛选（默认全选）
  useEffect(() => {
    const expenseCategories = getCategories();
    const incomeCategories = getIncomeCategories();
    setSelectedExpenseCategories(expenseCategories);
    setSelectedIncomeCategories(incomeCategories);
  }, [categoriesKey]); // 当分类变化时重新初始化

  // 加载存储的支出和收入记录
  const loadData = () => {
    const savedExpenses = loadExpenses();
    const savedIncomes = loadIncomes();
    const savedSleeps = loadSleepRecords();
    setExpenses(savedExpenses);
    setIncomes(savedIncomes);
    setSleepRecords(savedSleeps);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 添加新收入
  const handleAddIncome = (income: IncomeRecord) => {
    addIncome(income);
    const updatedIncomes = loadIncomes();
    setIncomes(updatedIncomes);
  };

  // 删除收入
  const handleDeleteIncome = (id: string) => {
    if (window.confirm('确定要删除这条收入记录吗？')) {
      deleteIncome(id);
      const updatedIncomes = loadIncomes();
      setIncomes(updatedIncomes);
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
  };

  // 添加新支出
  const handleAddExpense = (expense: ExpenseRecord) => {
    addExpense(expense);
    setExpenses(prev => [...prev, expense]);
  };

  // 删除支出记录
  const handleDeleteExpense = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  // 跳转到支出数据看板页面
  const goToExpenseDashboard = () => {
    window.location.hash = '#/records?type=expense';
  };

  // 跳转到收入数据看板页面
  const goToIncomeDashboard = () => {
    window.location.hash = '#/records?type=income';
  };

  // 跳转到睡眠数据面板页面
  const goToSleepDashboard = () => {
    window.location.hash = '#/sleep-records';
  };

  // === 支出相关操作 ===
  
  // 处理支出导出
  const handleExportExpenses = () => {
    try {
      const filteredExpenses = expenses.filter(e => selectedExpenseCategories.includes(e.category));
      
      const message = `确定导出支出记录吗？\n\n支出记录：${filteredExpenses.length} 条`;
      
      if (window.confirm(message)) {
        exportExpensesOnly(filteredExpenses);
        alert('支出数据导出成功！');
      }
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
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
      alert(message);
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
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
      alert(validationError);
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
      alert(`已清空 ${count} 条支出记录！`);
    }
  };

  // === 收入相关操作 ===
  
  // 处理收入导出
  const handleExportIncomes = () => {
    try {
      const filteredIncomes = incomes.filter(i => selectedIncomeCategories.includes(i.category));
      
      const message = `确定导出收入记录吗？\n\n收入记录：${filteredIncomes.length} 条`;
      
      if (window.confirm(message)) {
        exportIncomesOnly(filteredIncomes);
        alert('收入数据导出成功！');
      }
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
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
      alert(message);
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
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
      alert(validationError);
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
      alert(`已清空 ${count} 条收入记录！`);
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
  };

  // === 睡眠记录相关处理函数 ===
  
  // 添加睡眠记录
  const handleAddSleep = (sleep: SleepRecord) => {
    addSleepRecord(sleep);
    const updatedSleeps = loadSleepRecords();
    setSleepRecords(updatedSleeps);
  };

  // 删除睡眠记录
  const handleDeleteSleep = (id: string) => {
    if (window.confirm('确定要删除这条睡眠记录吗？')) {
      deleteSleepRecord(id);
      const updatedSleeps = loadSleepRecords();
      setSleepRecords(updatedSleeps);
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
  };

  // 取消编辑睡眠记录
  const handleCancelSleepEdit = () => {
    setEditingSleep(null);
  };

  // 切换业务模式
  const handleBusinessModeChange = (mode: BusinessMode) => {
    setBusinessMode(mode);
  };

  // === 清除数据功能 ===
  
  // === 清除记账数据功能已移到各自的CategoryFilter中 ===
  
  // 清除睡眠记录
  const handleClearSleepData = () => {
    const message = `⚠️ 警告：此操作将清空所有睡眠记录！\n\n当前数据：\n• 睡眠记录：${sleepRecords.length} 条\n\n此操作不可恢复，确定要清空吗？`;
    
    if (window.confirm(message)) {
      const count = clearAllSleepRecords();
      loadData(); // 重新加载数据
      alert(`已清空 ${count} 条睡眠记录！`);
    }
  };

  // === 睡眠记录导入导出功能 ===

  // 导出睡眠记录
  const handleExportSleep = () => {
    try {
      const message = `确定导出睡眠记录吗？\n\n总共 ${sleepRecords.length} 条记录`;
      
      if (window.confirm(message)) {
        exportSleepRecords();
        alert('睡眠记录导出成功！');
      }
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入睡眠记录
  const handleImportSleep = async (file: File) => {
    setIsImportingSleep(true);
    try {
      const result = await importSleepRecords(file);
      loadData(); // 重新加载数据
      
      const message = `导入完成！\n新增 ${result.imported} 条记录，跳过 ${result.skipped} 条重复记录\n总计 ${result.total} 条记录`;
      alert(message);
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
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
      alert(validationError);
      return;
    }

    handleImportSleep(file);
  };

  // 触发睡眠记录文件选择
  const triggerSleepFileSelect = () => {
    sleepFileInputRef.current?.click();
  };

  return (
    <div className="home">
      <header className="home__header">
        {/* 业务模式切换按钮 */}
        <div className="home__mode-switcher">
          <button 
            className={`mode-btn ${businessMode === BusinessMode.ACCOUNTING ? 'mode-btn--active' : ''}`}
            onClick={() => handleBusinessModeChange(BusinessMode.ACCOUNTING)}
          >
            💰 {BUSINESS_MODE_LABELS[BusinessMode.ACCOUNTING]}
          </button>
          <button 
            className={`mode-btn ${businessMode === BusinessMode.SLEEP ? 'mode-btn--active' : ''}`}
            onClick={() => handleBusinessModeChange(BusinessMode.SLEEP)}
          >
            🌙 {BUSINESS_MODE_LABELS[BusinessMode.SLEEP]}
          </button>
        </div>

        {/* 根据业务模式显示不同的标题 */}
        {businessMode === BusinessMode.ACCOUNTING ? (
          <>
            <h1>💰 记账本</h1>
            <p>轻松记录每一笔支出</p>
          </>
        ) : (
          <>
            <h1>🌙 睡眠记录</h1>
            <p>记录你的每一次睡眠</p>
          </>
        )}
      </header>

      <main className="home__main">
        <div className="home__container">
          {/* 根据业务模式渲染不同的内容 */}
          {businessMode === BusinessMode.ACCOUNTING ? (
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
                        totalAmount={expenses
                          .filter(e => selectedExpenseCategories.includes(e.category))
                          .reduce((sum, e) => sum + e.amount, 0)}
                        allTotalAmount={expenses.reduce((sum, e) => sum + e.amount, 0)}
                        onViewDashboard={goToExpenseDashboard}
                        onExport={handleExportExpenses}
                        onImport={triggerExpenseFileSelect}
                        onClear={handleClearExpenses}
                        isImporting={isImportingExpense}
                      />
                      <RecordList 
                        records={expenses.filter(e => selectedExpenseCategories.includes(e.category))} 
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
                        totalAmount={incomes
                          .filter(i => selectedIncomeCategories.includes(i.category))
                          .reduce((sum, i) => sum + i.amount, 0)}
                        allTotalAmount={incomes.reduce((sum, i) => sum + i.amount, 0)}
                        onViewDashboard={goToIncomeDashboard}
                        onExport={handleExportIncomes}
                        onImport={triggerIncomeFileSelect}
                        onClear={handleClearIncomes}
                        isImporting={isImportingIncome}
                      />
                      <RecordList 
                        records={incomes.filter(i => selectedIncomeCategories.includes(i.category))} 
                        onDeleteRecord={handleDeleteIncome}
                        onEditRecord={handleEditIncome}
                        type="income"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
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
                      sleeps={sleepRecords} 
                      onDeleteSleep={handleDeleteSleep}
                      onEditSleep={handleEditSleep}
                      onViewDashboard={goToSleepDashboard}
                      onExport={handleExportSleep}
                      onImport={triggerSleepFileSelect}
                      onClear={handleClearSleepData}
                      isImporting={isImportingSleep}
                    />
                  </div>
                </div>
              </div>
            </>
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
    </div>
  );
};

export default Home;