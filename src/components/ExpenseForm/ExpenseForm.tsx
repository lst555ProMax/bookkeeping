import React, { useState, useEffect } from 'react';
import { ExpenseCategory, ExpenseRecord } from '@/types';
import { generateId, formatDate, getCategories } from '@/utils';
import './ExpenseForm.scss';

interface ExpenseFormProps {
  onAddExpense: (expense: ExpenseRecord) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onOpenCategoryManager: () => void;
  onCancelEdit?: () => void;
  categoriesKey?: number; // 用于强制重新渲染
  editingExpense?: ExpenseRecord | null; // 正在编辑的支出
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onAddExpense, 
  onUpdateExpense,
  onOpenCategoryManager, 
  onCancelEdit,
  categoriesKey,
  editingExpense 
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('餐饮');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const isEditing = !!editingExpense;

  useEffect(() => {
    const loadCategoriesEffect = () => {
      const loadedCategories = getCategories();
      setCategories(loadedCategories);
      // 只有在分类列表为空或当前分类确实不存在时才重置
      if (loadedCategories.length > 0 && !loadedCategories.includes(category)) {
        setCategory(loadedCategories[0] || '其他');
      }
    };
    loadCategoriesEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey]); // 故意移除 category 依赖，避免循环更新

  // 当编辑状态变化时，更新表单数据
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description || '');
      setDate(editingExpense.date);
    } else {
      // 重置表单到初始状态
      setAmount('');
      setCategory(categories[0] || '餐饮');
      setDescription('');
      setDate(formatDate(new Date()));
    }
  }, [editingExpense, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    if (isEditing && editingExpense && onUpdateExpense) {
      // 编辑模式：更新现有支出
      const updatedExpense: ExpenseRecord = {
        ...editingExpense,
        date,
        amount: parseFloat(amount),
        category,
        description: description.trim() || undefined,
      };
      onUpdateExpense(updatedExpense);
    } else {
      // 添加模式：创建新支出
      const expense: ExpenseRecord = {
        id: generateId(),
        date,
        amount: parseFloat(amount),
        category,
        description: description.trim() || undefined,
        createdAt: new Date()
      };
      onAddExpense(expense);
    }
    
    // 如果不是编辑模式，重置表单
    if (!isEditing) {
      setAmount('');
      setDescription('');
      // 保持日期和类别不变，方便连续记账
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2 className="expense-form__title">{isEditing ? '编辑支出' : '添加支出'}</h2>
      
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
        <div className="expense-form__category-group">
          <select
            id="category"
            className="expense-form__select"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="expense-form__category-btn"
            onClick={onOpenCategoryManager}
            title="管理分类"
          >
            ⚙️
          </button>
        </div>
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

      <div className="expense-form__buttons">
        <button type="submit" className="expense-form__submit">
          {isEditing ? '保存编辑' : '添加支出'}
        </button>
        {isEditing && onCancelEdit && (
          <button 
            type="button" 
            className="expense-form__cancel"
            onClick={onCancelEdit}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;