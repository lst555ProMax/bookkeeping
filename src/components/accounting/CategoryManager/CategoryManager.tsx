import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ExpenseCategory, IncomeCategory, RecordType } from '@/utils';
import { 
  getManageableCategories, 
  addCategory, 
  deleteCategory, 
  updateCategory, 
  categoryHasRecords,
  saveCategoriesOrder,
  getManageableIncomeCategories,
  addIncomeCategory,
  deleteIncomeCategory,
  updateIncomeCategory,
  incomeCategoryHasRecords,
  saveIncomeCategoriesOrder
} from '@/utils';
import './CategoryManager.scss';

interface CategoryManagerProps {
  recordType: RecordType;
  onClose: () => void;
  onCategoriesChange: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ recordType, onClose, onCategoriesChange }) => {
  const isIncome = recordType === RecordType.INCOME;
  const [categories, setCategories] = useState<(ExpenseCategory | IncomeCategory)[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadedCategories = isIncome ? getManageableIncomeCategories() : getManageableCategories();
    setCategories(loadedCategories);
  }, [recordType, isIncome]); // 当类型改变时重新加载

  // ESC退出绑定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const loadCategories = () => {
    const loadedCategories = isIncome ? getManageableIncomeCategories() : getManageableCategories();
    setCategories(loadedCategories);
  };

  const handleAddCategory = () => {
    setError('');
    if (!newCategoryName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    if (newCategoryName.trim().length > 5) {
      toast.error('分类名称不能超过5个字');
      return;
    }

    if(window.confirm(`确定要添加"${newCategoryName}"分类吗？`)){
        const success = isIncome 
          ? addIncomeCategory(newCategoryName)
          : addCategory(newCategoryName);
        
        if (success) {
          setNewCategoryName('');
          loadCategories();
          onCategoriesChange();
          toast.success('分类添加成功');
        } else {
          toast.error('分类名称已存在');
        }
    }
  };

  const handleDeleteCategory = (category: ExpenseCategory | IncomeCategory) => {
    if (category === '其他') {
      toast('不能删除"其他"分类', { icon: '⚠️' });
      return;
    }

    const hasRecords = isIncome 
      ? incomeCategoryHasRecords(category as IncomeCategory)
      : categoryHasRecords(category as ExpenseCategory);
    
    const recordLabel = isIncome ? '收入' : '支出';
    const confirmMessage = hasRecords 
      ? `删除"${category}"分类将把该分类下的所有${recordLabel}记录转移到"其他"分类，确定要删除吗？`
      : `确定要删除"${category}"分类吗？`;

    if (window.confirm(confirmMessage)) {
      const success = isIncome
        ? deleteIncomeCategory(category as IncomeCategory)
        : deleteCategory(category as ExpenseCategory);
      
      if (success) {
        loadCategories();
        onCategoriesChange();
        setError('');
        toast.success('分类删除成功');
      } else {
        toast.error('删除分类失败');
      }
    }
  };

  const handleStartEdit = (category: ExpenseCategory | IncomeCategory) => {
    setEditingCategory(category);
    setEditingName(category);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
    setError('');
  };

  const handleSaveEdit = () => {
    setError('');
    if (!editingName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    if (editingName.trim().length > 5) {
      toast.error('分类名称不能超过5个字');
      return;
    }

    if (editingCategory) {
      const success = isIncome
        ? updateIncomeCategory(editingCategory as IncomeCategory, editingName)
        : updateCategory(editingCategory as ExpenseCategory, editingName);
      
      if (success) {
        setEditingCategory(null);
        setEditingName('');
        loadCategories();
        onCategoriesChange();
        toast.success('分类更新成功');
      } else {
        toast.error('分类名称已存在');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      // 阻止事件冒泡到window，防止触发表单的Ctrl+Enter监听器
      if (action === 'add') {
        handleAddCategory();
      } else {
        handleSaveEdit();
      }
    }
  };

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedIndex];
    
    // 移除被拖拽的项目
    newCategories.splice(draggedIndex, 1);
    
    // 在新位置插入
    newCategories.splice(dropIndex, 0, draggedCategory);
    
    setCategories(newCategories);
    
    // 保存新顺序（包含"其他"）
    if (isIncome) {
      saveIncomeCategoriesOrder(newCategories as IncomeCategory[]);
    } else {
      saveCategoriesOrder(newCategories as ExpenseCategory[]);
    }
    onCategoriesChange();
    
    setDraggedIndex(null);
  };

  return (
    <div className="category-manager">
      <div className="category-manager__overlay" onClick={onClose}></div>
      <div className="category-manager__modal">
        <div className="category-manager__header">
          <h3>管理{isIncome ? '收入' : '支出'}分类</h3>
          <button 
            className="category-manager__close" 
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="category-manager__content">
          {error && (
            <div className="category-manager__error">{error}</div>
          )}

          <div className="category-manager__add-section">
            <h4>添加新分类</h4>
            <div className="category-manager__add-form">
              <input
                type="text"
                className="category-manager__input"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'add')}
                placeholder="输入分类名称（最多5个字）"
                maxLength={5}
              />
              <button 
                className="category-manager__btn"
                onClick={handleAddCategory}
                title="添加分类"
              >
                🏷️➕
              </button>
            </div>
          </div>

          <div className="category-manager__list-section">
            <h4>现有分类 <span className="category-manager__drag-hint">（拖拽以改变顺序）</span></h4>
            <div className="category-manager__list">
              {categories.map((category, index) => (
                <div 
                  key={category} 
                  className={`category-manager__item ${draggedIndex === index ? 'dragging' : ''}`}
                  draggable={editingCategory !== category}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="category-manager__view">
                    {editingCategory === category ? (
                      <>
                        <div className="category-manager__drag-handle" style={{ opacity: 0.3 }}>
                          ⋮⋮
                        </div>
                        <input
                          type="text"
                          className="category-manager__input category-manager__input--inline"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'edit')}
                          maxLength={5}
                          autoFocus
                        />
                        <div className="category-manager__actions">
                          <button 
                            className="category-manager__btn"
                            onClick={handleCancelEdit}
                            title="取消编辑"
                          >
                            ❌
                          </button>
                          <button 
                            className="category-manager__btn"
                            onClick={handleSaveEdit}
                            title="保存编辑"
                          >
                            💾
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="category-manager__drag-handle">
                          ⋮⋮
                        </div>
                        <span className="category-manager__name">
                          {category}
                          {(isIncome 
                            ? incomeCategoryHasRecords(category as IncomeCategory)
                            : categoryHasRecords(category as ExpenseCategory)
                          ) && (
                            <span className="category-manager__has-records"> (有记录)</span>
                          )}
                        </span>
                        <div className="category-manager__actions">
                          <button 
                            className="category-manager__btn"
                            onClick={() => handleStartEdit(category)}
                            title="编辑分类"
                          >
                            ✏️
                          </button>
                          <button 
                            className="category-manager__btn"
                            onClick={() => handleDeleteCategory(category)}
                            title="删除分类"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;