import React, { useState, useEffect, useRef } from 'react';
import { ExpenseForm, ExpenseList, CategoryManager } from '@/components';
import { ExpenseRecord } from '@/types';
import { loadExpenses, addExpense, deleteExpense, updateExpense, exportExpenses, importExpenses, validateImportFile } from '@/utils';
import './Home.scss';

const Home: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoriesKey, setCategoriesKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载存储的支出记录
  const loadData = () => {
    const savedExpenses = loadExpenses();
    setExpenses(savedExpenses);
  };

  useEffect(() => {
    loadData();
  }, []);

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
      alert(`导入完成！新增 ${result.imported} 条记录，跳过 ${result.skipped} 条记录`);
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
  const handleOpenCategoryManager = () => {
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

  return (
    <div className="home">
      <header className="home__header">
        <h1>💰 记账本</h1>
        <p>轻松记录每一笔支出</p>
      </header>

      <main className="home__main">
        <div className="home__container">
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
          {/* 添加支出表单 */}
          <div className="home__form-section">
            <ExpenseForm 
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onOpenCategoryManager={handleOpenCategoryManager}
              onCancelEdit={handleCancelEdit}
              categoriesKey={categoriesKey}
              editingExpense={editingExpense}
            />
          </div>

          {/* 支出记录列表 */}
          <div className="home__list-section">
            <div className="expense-list-container">
              <ExpenseList 
                expenses={expenses} 
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={handleEditExpense}
              />
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* 分类管理器模态框 */}
      {showCategoryManager && (
        <CategoryManager
          onClose={handleCloseCategoryManager}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
    </div>
  );
};

export default Home;