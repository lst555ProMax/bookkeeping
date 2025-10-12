import React, { useState, useEffect } from 'react';
import { ExpenseForm, ExpenseList } from '@/components';
import { ExpenseRecord } from '@/types';
import { loadExpenses, addExpense, deleteExpense } from '@/utils';
import './Home.scss';

const Home: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  // 加载存储的支出记录
  useEffect(() => {
    const savedExpenses = loadExpenses();
    setExpenses(savedExpenses);
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
          </div>
          <div className="home__section-group">
          {/* 添加支出表单 */}
          <div className="home__form-section">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          {/* 支出记录列表 */}
          <div className="home__list-section">
            <div className="expense-list-container">
              <ExpenseList 
                expenses={expenses} 
                onDeleteExpense={handleDeleteExpense} 
              />
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;