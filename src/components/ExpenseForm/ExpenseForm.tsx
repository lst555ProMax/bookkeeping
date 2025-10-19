import React, { useState, useEffect } from 'react';
import { ExpenseCategory, ExpenseRecord, IncomeCategory, IncomeRecord, RecordType } from '@/types';
import { generateId, formatDate, getCategories, getIncomeCategories } from '@/utils';
import './ExpenseForm.scss';

interface ExpenseFormProps {
  onAddExpense: (expense: ExpenseRecord) => void;
  onAddIncome: (income: IncomeRecord) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onUpdateIncome?: (income: IncomeRecord) => void;
  onOpenCategoryManager: (type: RecordType) => void;
  onCancelEdit?: () => void;
  categoriesKey?: number; // 用于强制重新渲染
  editingExpense?: ExpenseRecord | null; // 正在编辑的支出
  editingIncome?: IncomeRecord | null; // 正在编辑的收入
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onAddExpense,
  onAddIncome,
  onUpdateExpense,
  onUpdateIncome,
  onOpenCategoryManager,
  onCancelEdit,
  categoriesKey,
  editingExpense,
  editingIncome
}) => {
  const [recordType, setRecordType] = useState<RecordType>(RecordType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('餐饮');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);

  const isEditing = !!(editingExpense || editingIncome);
  const currentCategories = recordType === RecordType.EXPENSE ? expenseCategories : incomeCategories;

  // 动态确定主题类
  const getThemeClass = () => {
    if (isEditing) return 'theme-edit'; // 编辑模式：蓝色
    if (recordType === RecordType.INCOME) return 'theme-income'; // 收入模式：绿色
    return 'theme-expense'; // 支出模式：紫色（默认）
  };

  useEffect(() => {
    const loadCategoriesEffect = () => {
      const loadedExpenseCategories = getCategories();
      const loadedIncomeCategories = getIncomeCategories();
      setExpenseCategories(loadedExpenseCategories);
      setIncomeCategories(loadedIncomeCategories);
      
      // 只有在分类列表为空或当前分类确实不存在时才重置
      if (recordType === RecordType.EXPENSE) {
        if (loadedExpenseCategories.length > 0 && !loadedExpenseCategories.includes(category as ExpenseCategory)) {
          setCategory(loadedExpenseCategories[0] || '其他');
        }
      } else {
        if (loadedIncomeCategories.length > 0 && !loadedIncomeCategories.includes(category as IncomeCategory)) {
          setCategory(loadedIncomeCategories[0] || '其他');
        }
      }
    };
    loadCategoriesEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey, recordType]); // 故意移除 category 依赖，避免循环更新

  // 当编辑状态变化时，更新表单数据
  useEffect(() => {
    if (editingExpense) {
      setRecordType(RecordType.EXPENSE);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description || '');
      setDate(editingExpense.date);
    } else if (editingIncome) {
      setRecordType(RecordType.INCOME);
      setAmount(editingIncome.amount.toString());
      setCategory(editingIncome.category);
      setDescription(editingIncome.description || '');
      setDate(editingIncome.date);
    } else {
      // 重置表单到初始状态
      setAmount('');
      setDescription('');
      setDate(formatDate(new Date()));
      if (recordType === RecordType.EXPENSE) {
        setCategory(expenseCategories[0] || '餐饮');
      } else {
        setCategory(incomeCategories[0] || '工资收入');
      }
    }
  }, [editingExpense, editingIncome, expenseCategories, incomeCategories, recordType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    if (isEditing) {
      if (editingExpense && onUpdateExpense) {
        // 编辑支出模式
        const updatedExpense: ExpenseRecord = {
          ...editingExpense,
          date,
          amount: parseFloat(amount),
          category: category as ExpenseCategory,
          description: description.trim() || undefined,
        };
        onUpdateExpense(updatedExpense);
      } else if (editingIncome && onUpdateIncome) {
        // 编辑收入模式
        const updatedIncome: IncomeRecord = {
          ...editingIncome,
          date,
          amount: parseFloat(amount),
          category: category as IncomeCategory,
          description: description.trim() || undefined,
        };
        onUpdateIncome(updatedIncome);
      }
    } else {
      if (recordType === RecordType.EXPENSE) {
        // 添加支出模式
        const expense: ExpenseRecord = {
          id: generateId(),
          date,
          amount: parseFloat(amount),
          category: category as ExpenseCategory,
          description: description.trim() || undefined,
          createdAt: new Date()
        };
        onAddExpense(expense);
      } else {
        // 添加收入模式
        const income: IncomeRecord = {
          id: generateId(),
          date,
          amount: parseFloat(amount),
          category: category as IncomeCategory,
          description: description.trim() || undefined,
          createdAt: new Date()
        };
        onAddIncome(income);
      }
    }
    
    // 如果不是编辑模式，重置表单
    if (!isEditing) {
      setAmount('');
      setDescription('');
      // 保持日期和类别不变，方便连续记账
    }
  };

  // 切换收入/支出类型
  const handleToggleRecordType = () => {
    const newType = recordType === RecordType.EXPENSE ? RecordType.INCOME : RecordType.EXPENSE;
    setRecordType(newType);
    
    // 重置分类到新类型的默认分类
    if (newType === RecordType.EXPENSE) {
      setCategory(expenseCategories[0] || '餐饮');
    } else {
      setCategory(incomeCategories[0] || '工资收入');
    }
  };

  return (
    <form className={`expense-form ${getThemeClass()}`} onSubmit={handleSubmit}>
      <div className="expense-form__header">
        <h2 className="expense-form__title">
          {isEditing 
            ? (editingExpense ? '编辑支出' : '编辑收入')
            : (recordType === RecordType.EXPENSE ? '添加支出' : '添加收入')
          }
        </h2>
        {!isEditing && (
          <button
            type="button"
            className="expense-form__toggle"
            onClick={handleToggleRecordType}
            title={recordType === RecordType.EXPENSE ? '切换到收入' : '切换到支出'}
          >
            🔄
          </button>
        )}
      </div>
      
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
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="expense-form__category-btn"
            onClick={() => onOpenCategoryManager(recordType)}
            title={recordType === RecordType.EXPENSE ? "管理支出分类" : "管理收入分类"}
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
          {isEditing 
            ? (editingExpense ? '保存编辑' : '保存编辑') 
            : (recordType === RecordType.EXPENSE ? '添加支出' : '添加收入')
          }
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