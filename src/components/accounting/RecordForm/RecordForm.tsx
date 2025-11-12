import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ExpenseCategory, ExpenseRecord, IncomeCategory, IncomeRecord, RecordType } from '@/utils';
import { generateId, formatDate, getCategories, getIncomeCategories } from '@/utils';
import { DatePicker, Select } from '@/components/common';
import type { SelectOption } from '@/components/common';
import './RecordForm.scss';

interface RecordFormProps {
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

const RecordForm: React.FC<RecordFormProps> = ({ 
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
  
  // 将分类数组转换为 SelectOption 数组
  const categoryOptions: SelectOption[] = currentCategories.map(cat => ({
    value: cat,
    label: cat
  }));

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
      
      // 保存旧的分类列表用于比对
      const oldExpenseCategories = expenseCategories;
      const oldIncomeCategories = incomeCategories;
      
      setExpenseCategories(loadedExpenseCategories);
      setIncomeCategories(loadedIncomeCategories);
      
      // 在编辑模式下，不自动重置分类
      // 因为记录的分类已经在 categoryManager 中被更新了
      if (isEditing) {
        return;
      }
      
      // 非编辑模式下，智能处理分类变化
      if (recordType === RecordType.EXPENSE) {
        // 如果当前分类不在新列表中
        if (loadedExpenseCategories.length > 0 && !loadedExpenseCategories.includes(category as ExpenseCategory)) {
          // 尝试找到被重命名的分类（通过索引位置）
          const oldIndex = oldExpenseCategories.indexOf(category as ExpenseCategory);
          if (oldIndex !== -1 && oldIndex < loadedExpenseCategories.length) {
            // 如果索引位置有效，使用新列表中相同位置的分类（可能是重命名的）
            setCategory(loadedExpenseCategories[oldIndex]);
          } else {
            // 否则选择"其他"分类（永远存在且不会被删除）
            setCategory('其他');
          }
        }
      } else {
        // 收入分类同样处理
        if (loadedIncomeCategories.length > 0 && !loadedIncomeCategories.includes(category as IncomeCategory)) {
          const oldIndex = oldIncomeCategories.indexOf(category as IncomeCategory);
          if (oldIndex !== -1 && oldIndex < loadedIncomeCategories.length) {
            setCategory(loadedIncomeCategories[oldIndex]);
          } else {
            setCategory('其他');
          }
        }
      }
    };
    loadCategoriesEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey, recordType]); // 故意移除 category 和 isEditing 依赖，避免循环更新

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingExpense, editingIncome]); // 移除 expenseCategories, incomeCategories, recordType 依赖

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的金额');
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
    
    // 切换类型时，设置分类为第一个
    if (newType === RecordType.EXPENSE) {
      if (expenseCategories.length > 0) {
        setCategory(expenseCategories[0]);
      }
    } else {
      if (incomeCategories.length > 0) {
        setCategory(incomeCategories[0]);
      }
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
        <DatePicker
          value={date}
          onChange={setDate}
          minDate="2025-10-01"
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
          <Select
            id="category"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="请选择分类"
            required
            className="expense-form__select"
          />
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

export default RecordForm;