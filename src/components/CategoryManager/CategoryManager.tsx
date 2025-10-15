import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '@/types';
import { 
  getManageableCategories, 
  addCategory, 
  deleteCategory, 
  updateCategory, 
  categoryHasRecords,
  saveCategoriesOrder
} from '@/utils';
import './CategoryManager.scss';

interface CategoryManagerProps {
  onClose: () => void;
  onCategoriesChange: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose, onCategoriesChange }) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const loadedCategories = getManageableCategories();
    setCategories(loadedCategories);
  };

  const handleAddCategory = () => {
    setError('');
    if (!newCategoryName.trim()) {
      window.alert('分类名称不能为空');
      return;
    }

    if(window.confirm(`确定要添加"${newCategoryName}"分类吗？`)){
        const success = addCategory(newCategoryName);
        if (success) {
        setNewCategoryName('');
        loadCategories();
        onCategoriesChange();
        } else {
        window.alert('分类名称已存在');
        }
    }
  };

  const handleDeleteCategory = (category: ExpenseCategory) => {
    if (category === '其他') {
      window.alert('不能删除"其他"分类');
      return;
    }

    const hasRecords = categoryHasRecords(category);
    const confirmMessage = hasRecords 
      ? `删除"${category}"分类将把该分类下的所有记录转移到"其他"分类，确定要删除吗？`
      : `确定要删除"${category}"分类吗？`;

    if (window.confirm(confirmMessage)) {
      const success = deleteCategory(category);
      if (success) {
        loadCategories();
        onCategoriesChange();
        setError('');
      } else {
        window.alert('删除分类失败');
      }
    }
  };

  const handleStartEdit = (category: ExpenseCategory) => {
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
      window.alert('分类名称不能为空');
      return;
    }

    if (editingCategory) {
      const success = updateCategory(editingCategory, editingName);
      if (success) {
        setEditingCategory(null);
        setEditingName('');
        loadCategories();
        onCategoriesChange();
      } else {
        window.alert('分类名称已存在');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
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
    saveCategoriesOrder(newCategories);
    onCategoriesChange();
    
    setDraggedIndex(null);
  };

  return (
    <div className="category-manager">
      <div className="category-manager__overlay" onClick={onClose}></div>
      <div className="category-manager__modal">
        <div className="category-manager__header">
          <h3>管理分类</h3>
          <button 
            className="category-manager__close" 
            onClick={onClose}
            type="button"
          >
            ×
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
                onKeyPress={(e) => handleKeyPress(e, 'add')}
                placeholder="输入分类名称"
                maxLength={20}
              />
              <button 
                className="category-manager__btn category-manager__btn--primary"
                onClick={handleAddCategory}
                type="button"
              >
                添加
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
                  {editingCategory === category ? (
                    <div className="category-manager__edit-form">
                      <input
                        type="text"
                        className="category-manager__input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'edit')}
                        maxLength={20}
                        autoFocus
                      />
                      <div className="category-manager__edit-actions">
                        <button 
                          className="category-manager__btn category-manager__btn--primary"
                          onClick={handleSaveEdit}
                          type="button"
                        >
                          保存
                        </button>
                        <button 
                          className="category-manager__btn category-manager__btn--secondary"
                          onClick={handleCancelEdit}
                          type="button"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="category-manager__view">
                      <div className="category-manager__drag-handle">
                        ⋮⋮
                      </div>
                      <span className="category-manager__name">
                        {category}
                        {categoryHasRecords(category) && (
                          <span className="category-manager__has-records"> (有记录)</span>
                        )}
                      </span>
                      <div className="category-manager__actions">
                        <button 
                          className="category-manager__btn category-manager__btn--secondary"
                          onClick={() => handleStartEdit(category)}
                          type="button"
                        >
                          编辑
                        </button>
                        <button 
                          className="category-manager__btn category-manager__btn--danger"
                          onClick={() => handleDeleteCategory(category)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
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