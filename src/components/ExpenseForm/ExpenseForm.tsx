import React, { useState } from 'react';
import { ExpenseCategory, ExpenseRecord } from '@/types';
import { generateId, formatDate } from '@/utils';
import './ExpenseForm.scss';

interface ExpenseFormProps {
  onAddExpense: (expense: ExpenseRecord) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MEALS);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    const expense: ExpenseRecord = {
      id: generateId(),
      date,
      amount: parseFloat(amount),
      category,
      description: description.trim() || undefined,
      createdAt: new Date()
    };

    onAddExpense(expense);
    
    // 重置表单
    setAmount('');
    setDescription('');
    // 保持日期和类别不变，方便连续记账
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2 className="expense-form__title">添加支出</h2>
      
      <div className="expense-form__group">
        <label htmlFor="date" className="expense-form__label">日期</label>
        <input
          type="date"
          id="date"
          className="expense-form__input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min="2025-10-01"
          required
        />
      </div>

      <div className="expense-form__group">
        <label htmlFor="amount" className="expense-form__label">金额 (¥)</label>
        <input
          type="number"
          id="amount"
          className="expense-form__input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
        />
      </div>

      <div className="expense-form__group">
        <label htmlFor="category" className="expense-form__label">分类</label>
        <select
          id="category"
          className="expense-form__select"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          required
        >
          {Object.values(ExpenseCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="expense-form__group">
        <label htmlFor="description" className="expense-form__label">备注（可选）</label>
        <input
          type="text"
          id="description"
          className="expense-form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请输入备注信息"
          maxLength={100}
        />
      </div>

      <button type="submit" className="expense-form__submit">
        添加支出
      </button>
    </form>
  );
};

export default ExpenseForm;