import React, { useState, useEffect, useRef } from 'react';
import { ExpenseForm, ExpenseList, IncomeList, CategoryManager, SleepForm, SleepList } from '@/components';
import { ExpenseRecord, IncomeRecord, RecordType, SleepRecord, BusinessMode, BUSINESS_MODE_LABELS } from '@/types';
import { 
  loadExpenses, addExpense, deleteExpense, updateExpense,
  loadIncomes, addIncome, deleteIncome, updateIncome,
  exportExpenses, importExpenses, validateImportFile,
  loadSleepRecords, addSleepRecord, deleteSleepRecord, updateSleepRecord,
  exportSleepRecords, importSleepRecords, validateSleepImportFile
} from '@/utils';
import './Home.scss';

const Home: React.FC = () => {
  // 业务模式状态
  const [businessMode, setBusinessMode] = useState<BusinessMode>(BusinessMode.ACCOUNTING);
  
  // 记账相关状态
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryManagerType, setCategoryManagerType] = useState<RecordType>(RecordType.EXPENSE);
  const [categoriesKey, setCategoriesKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 睡眠记录相关状态
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [editingSleep, setEditingSleep] = useState<SleepRecord | null>(null);
  const [isImportingSleep, setIsImportingSleep] = useState(false);
  const sleepFileInputRef = useRef<HTMLInputElement>(null);

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

  // 跳转到数据看板页面
  const goToDashboard = () => {
    window.location.hash = '#/records';
  };

  // 跳转到睡眠数据面板页面
  const goToSleepDashboard = () => {
    window.location.hash = '#/sleep-records';
  };

  // 处理导出
  const handleExport = () => {
    try {
      exportExpenses();
      alert('数据导出成功！');
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 处理导入
  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const result = await importExpenses(file);
      loadData(); // 重新加载数据
      
      const totalImported = result.importedExpenses + result.importedIncomes;
      const totalSkipped = result.skippedExpenses + result.skippedIncomes;
      
      let message = `导入完成！\n`;
      if (result.importedExpenses > 0 || result.skippedExpenses > 0) {
        message += `支出记录：新增 ${result.importedExpenses} 条，跳过 ${result.skippedExpenses} 条\n`;
      }
      if (result.importedIncomes > 0 || result.skippedIncomes > 0) {
        message += `收入记录：新增 ${result.importedIncomes} 条，跳过 ${result.skippedIncomes} 条\n`;
      }
      message += `总计：新增 ${totalImported} 条，跳过 ${totalSkipped} 条`;
      
      alert(message);
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImportFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    handleImport(file);
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
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
  };

  // 开始编辑支出记录
  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
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

  // === 睡眠记录导入导出功能 ===

  // 导出睡眠记录
  const handleExportSleep = () => {
    try {
      exportSleepRecords();
      alert('睡眠记录导出成功！');
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
              {/* 快捷操作区 */}
              <div className="home__quick-actions">
                <button className="quick-action-btn" onClick={goToDashboard}>
                  📊 查看数据看板
                </button>
                <button className="quick-action-btn quick-action-btn--export" onClick={handleExport}>
                  📤 导出数据
                </button>
                <button 
                  className="quick-action-btn quick-action-btn--import" 
                  onClick={triggerFileSelect}
                  disabled={isImporting}
                >
                  {isImporting ? '📥 导入中...' : '📥 导入数据'}
                </button>
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div className="home__section-group">
                {/* 记录列表 */}
                <div className="home__list-section">
                  <div className="records-container">
                    {/* 支出记录列表 */}
                    <div className="expense-list-container">
                      <h3>支出记录</h3>
                      <ExpenseList 
                        expenses={expenses} 
                        onDeleteExpense={handleDeleteExpense}
                        onEditExpense={handleEditExpense}
                      />
                    </div>
                    
                    {/* 添加支出表单 */}
                    <div className="form-container">
                      <ExpenseForm
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
                      <h3>收入记录</h3>
                      <IncomeList 
                        incomes={incomes} 
                        onDeleteIncome={handleDeleteIncome}
                        onEditIncome={handleEditIncome}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 睡眠记录模式 */}
              {/* 快捷操作区 */}
              <div className="home__quick-actions">
                <button className="quick-action-btn" onClick={goToSleepDashboard}>
                  📊 查看数据面板
                </button>
                <button className="quick-action-btn quick-action-btn--export" onClick={handleExportSleep}>
                  📤 导出睡眠记录
                </button>
                <button 
                  className="quick-action-btn quick-action-btn--import" 
                  onClick={triggerSleepFileSelect}
                  disabled={isImportingSleep}
                >
                  {isImportingSleep ? '📥 导入中...' : '📥 导入睡眠记录'}
                </button>
              </div>

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
                    <h3>睡眠记录</h3>
                    <SleepList 
                      sleeps={sleepRecords} 
                      onDeleteSleep={handleDeleteSleep}
                      onEditSleep={handleEditSleep}
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