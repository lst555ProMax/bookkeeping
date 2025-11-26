import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ExpenseCategory, ExpenseRecord, IncomeCategory, IncomeRecord, RecordType } from '@/utils';
import { generateId, formatDate, getCategories, getIncomeCategories } from '@/utils';
import { DatePicker, FormSelect, FormNumberInput, FormTextarea } from '@/components/common';
import type { FormSelectOption } from '@/components/common';
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
  // 从 localStorage 恢复表单数据（页面切换时保持）
  const loadFormData = () => {
    const saved = localStorage.getItem('recordFormData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data;
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedFormData = loadFormData();
  const [recordType, setRecordType] = useState<RecordType>(savedFormData?.recordType || RecordType.EXPENSE);
  const [amount, setAmount] = useState(savedFormData?.amount || '');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>(savedFormData?.category || '餐饮');
  const [description, setDescription] = useState(savedFormData?.description || '');
  const [date, setDate] = useState(savedFormData?.date || formatDate(new Date()));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);

  const isEditing = !!(editingExpense || editingIncome);
  const currentCategories = recordType === RecordType.EXPENSE ? expenseCategories : incomeCategories;
  
  // 将分类数组转换为 FormSelectOption 数组
  const categoryOptions: FormSelectOption[] = currentCategories.map(cat => ({
    value: cat,
    label: cat
  }));

  // 动态确定主题类
  const getThemeClass = () => {
    // 编辑模式下根据记录类型决定颜色，保持与添加模式一致
    if (recordType === RecordType.INCOME) return 'theme-income'; // 收入模式：绿色
    return 'theme-expense'; // 支出模式：橙色（默认）
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
  }, [categoriesKey]); // 只在分类列表变化时触发，recordType 改变时 onChange 已处理分类设置

  // 检查是否是页面刷新（首次加载）
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    const initialized = sessionStorage.getItem('recordFormInitialized');
    if (!initialized) {
      sessionStorage.setItem('recordFormInitialized', 'true');
      // 首次加载时清除 localStorage 中的表单数据
      localStorage.removeItem('recordFormData');
      return true;
    }
    return false;
  });

  useEffect(() => {
    // 监听页面卸载，清除标记（刷新时会重新设置）
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('recordFormInitialized');
      // 刷新时清除表单数据
      localStorage.removeItem('recordFormData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 保存表单数据到 localStorage（页面切换时保持）
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('recordFormData', JSON.stringify({
        recordType,
        amount,
        category,
        description,
        date
      }));
    }
  }, [recordType, amount, category, description, date, isEditing]);

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
      // 只在页面刷新时重置表单，页面切换时不重置（数据已从 localStorage 恢复）
      if (isFirstLoad && !savedFormData) {
        // 重置表单到初始状态
        setAmount('');
        setDescription('');
        setDate(formatDate(new Date()));
        if (recordType === RecordType.EXPENSE) {
          setCategory(expenseCategories[0] || '餐饮');
        } else {
          setCategory(incomeCategories[0] || '工资收入');
        }
        setIsFirstLoad(false); // 标记已处理首次加载
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingExpense, editingIncome]); // 移除 isFirstLoad 依赖，避免重复执行

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


  // 快捷键处理：Ctrl + Enter 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const form = document.querySelector('.expense-form__form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`expense-form ${getThemeClass()}`}>
      <div className="expense-form__header">
        <h2 className="expense-form__title">
          {isEditing 
            ? (editingExpense ? '✏️ 编辑支出' : '✏️ 编辑收入')
            : '💰 添加收支'
          }
        </h2>
      </div>
      
      <form className="expense-form__form" onSubmit={handleSubmit}>
      <div className="expense-form__group">
        <label className="expense-form__label">
          🔄 模式 <span className="required">*</span>
        </label>
        <div className="expense-form__radio-group">
          {(!isEditing || recordType === RecordType.EXPENSE) && (
            <label className={`expense-form__radio ${recordType === RecordType.EXPENSE ? 'active' : ''} ${isEditing ? 'disabled' : ''}`}>
              <input
                type="radio"
                name="recordType"
                value={RecordType.EXPENSE}
                checked={recordType === RecordType.EXPENSE}
                disabled={isEditing}
                onChange={() => {
                  if (!isEditing) {
                    setRecordType(RecordType.EXPENSE);
                    if (expenseCategories.length > 0) {
                      setCategory(expenseCategories[0]);
                    }
                  }
                }}
              />
              <span>支出</span>
            </label>
          )}
          {(!isEditing || recordType === RecordType.INCOME) && (
            <label className={`expense-form__radio ${recordType === RecordType.INCOME ? 'active' : ''} ${isEditing ? 'disabled' : ''}`}>
              <input
                type="radio"
                name="recordType"
                value={RecordType.INCOME}
                checked={recordType === RecordType.INCOME}
                disabled={isEditing}
                onChange={() => {
                  if (!isEditing) {
                    setRecordType(RecordType.INCOME);
                    if (incomeCategories.length > 0) {
                      setCategory(incomeCategories[0]);
                    }
                  }
                }}
              />
              <span>收入</span>
            </label>
          )}
        </div>
      </div>
      <div className="expense-form__group">
        <label htmlFor="date" className="expense-form__label">
          📅 日期 <span className="required">*</span>
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          minDate="2025-10-01"
        />
      </div>

      <div className="expense-form__group">
        <label htmlFor="amount" className="expense-form__label">
          💰 金额 (¥) <span className="required">*</span>
        </label>
        <FormNumberInput
          id="amount"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          min={0}
          step={0.01}
          arrowStep={10}
          wheelStep={10}
          decimalPlaces={2}
          required
        />
      </div>

      <div className="expense-form__group">
        <label htmlFor="category" className="expense-form__label">
          🏷️ 分类 <span className="required">*</span>
        </label>
        <div className="expense-form__category-group">
          <FormSelect
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
        <label htmlFor="description" className="expense-form__label">📝 备注</label>
        <FormTextarea
          id="description"
          value={description}
          onChange={setDescription}
          placeholder="记录今天的收支情况..."
          maxLength={100}
        />
      </div>

      <div className="expense-form__buttons">
        <button type="submit" className="expense-form__submit">
          {isEditing ? '更新记录' : '添加记录'}
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
    </div>
  );
};

export default RecordForm;