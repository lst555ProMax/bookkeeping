import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ActivityCategoryConfig, ActivityItem, CardType, CardCategory } from '@/types';
import {
  loadActivityConfig,
  saveActivityConfig,
  resetActivityConfig,
  addCategory,
  deleteCategory,
  addActivityItem,
  updateActivityItem,
  deleteActivityItem,
  validateProbabilities
} from '@/utils/cardDraw/activityConfig';
import './ActivityManager.scss';

interface ActivityManagerProps {
  onClose: () => void;
  onConfigChange: () => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ onClose, onConfigChange }) => {
  const [config, setConfig] = useState<ActivityCategoryConfig[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryProb, setEditingCategoryProb] = useState(0);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemProb, setEditingItemProb] = useState(0);

  useEffect(() => {
    const loaded = loadActivityConfig();
    setConfig(loaded);
    if (loaded.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loaded[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = () => {
    const loaded = loadActivityConfig();
    setConfig(loaded);
    if (loaded.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loaded[0].id);
    }
  };

  const selectedCategory = config.find(c => c.id === selectedCategoryId);

  // 计算除自定义外的概率总和，并自动设置自定义概率
  const calculateCustomProbability = (categories: ActivityCategoryConfig[]) => {
    const customCategory = categories.find(c => c.name === '自定义');
    if (!customCategory) return categories;

    const nonCustomTotal = categories
      .filter(c => c.name !== '自定义')
      .reduce((sum, c) => sum + c.totalProbability, 0);
    
    const customProb = 1 - nonCustomTotal;
    customCategory.totalProbability = customProb;
    
    return categories;
  };

  // 检查配置是否有效（自定义概率是否为负）
  const isConfigValid = () => {
    const customCategory = config.find(c => c.name === '自定义');
    if (!customCategory) return true;
    return customCategory.totalProbability >= 0;
  };

  // 格式化概率为整数
  const formatProbability = (prob: number) => Math.round(prob * 100);

  // 计算二级分类概率总和
  const calculateItemsProbabilitySum = (categoryId: string): number => {
    const category = config.find(c => c.id === categoryId);
    if (!category) return 0;
    return category.items.reduce((sum, item) => sum + item.probability, 0);
  };

  // 添加一级分类（直接创建新分类）
  const handleAddCategory = () => {
    // 生成唯一的名称
    let categoryName = '新分类';
    let counter = 1;
    while (config.some(c => c.name === categoryName)) {
      categoryName = `新分类${counter}`;
      counter++;
    }

    const categoryEnum = CardCategory.CUSTOM; // 新建的都是自定义类型
    const newConfig = addCategory(categoryName, categoryEnum);
    setError('');
    loadConfig();
    onConfigChange();
    
    // 找到刚创建的分类ID，自动进入编辑状态
    const newCategory = newConfig.find(c => c.name === categoryName);
    if (newCategory) {
      setEditingCategoryId(newCategory.id);
      setEditingCategoryName(categoryName);
      setEditingCategoryProb(0);
    }
  };

  // 更新一级分类
  const handleUpdateCategory = (id: string, updates: Partial<ActivityCategoryConfig>) => {
    const newConfig = config.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    
    // 重新计算自定义概率
    const updated = calculateCustomProbability(newConfig);
    setConfig(updated);
    saveActivityConfig(updated);
    onConfigChange();
    setEditingCategoryId(null);
  };

  // 删除一级分类
  const handleDeleteCategory = (id: string) => {
    const category = config.find(c => c.id === id);
    if (!category) return;

    if (window.confirm(`确定要删除"${category.name}"分类吗？该分类下的所有活动也将被删除。`)) {
      deleteCategory(id);
      loadConfig();
      onConfigChange();
      if (selectedCategoryId === id) {
        setSelectedCategoryId(config[0]?.id || null);
      }
    }
  };

  // 添加二级活动项
  const handleAddItem = () => {
    if (!selectedCategoryId) {
      setError('请先选择一个分类');
      return;
    }

    // 生成唯一的名称
    const category = config.find(c => c.id === selectedCategoryId);
    if (!category) return;

    let itemName = '新活动';
    let counter = 1;
    while (category.items.some(item => item.name === itemName)) {
      itemName = `新活动${counter}`;
      counter++;
    }

    const newConfig = addActivityItem(selectedCategoryId, itemName, CardType.CUSTOM);
    setError('');
    loadConfig();
    onConfigChange();
    
    // 找到刚创建的活动ID，自动进入编辑状态
    const updatedCategory = newConfig.find(c => c.id === selectedCategoryId);
    const newItem = updatedCategory?.items.find(i => i.name === itemName);
    if (newItem) {
      setEditingItemId(newItem.id);
    }
  };

  // 自动平衡当前分类的二级活动概率
  const handleAutoBalanceItems = () => {
    if (!selectedCategoryId) return;

    const category = config.find(c => c.id === selectedCategoryId);
    if (!category || category.items.length === 0) {
      window.alert('当前分类没有活动项');
      return;
    }

    const newConfig = [...config];
    const targetCategory = newConfig.find(c => c.id === selectedCategoryId);
    if (targetCategory) {
      // 计算整数概率分配
      const totalPercent = formatProbability(targetCategory.totalProbability); // 总概率（整数）
      const itemCount = targetCategory.items.length;
      const basePercent = Math.floor(totalPercent / itemCount); // 基础概率
      const remainder = totalPercent - (basePercent * itemCount); // 余数
      
      // 分配概率：前remainder个项目多分配1%
      targetCategory.items.forEach((item, index) => {
        const percent = index < remainder ? basePercent + 1 : basePercent;
        item.probability = percent / 100;
      });
    }

    setConfig(newConfig);
    saveActivityConfig(newConfig);
    onConfigChange();
    setError('');
  };

  // 更新二级活动项
  const handleUpdateItem = (categoryId: string, itemId: string, updates: Partial<ActivityItem>) => {
    updateActivityItem(categoryId, itemId, updates);
    loadConfig();
    onConfigChange();
    setEditingItemId(null);
  };

  // 开始编辑二级活动项
  const startEditItem = (item: ActivityItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemProb(formatProbability(item.probability));
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setEditingItemName('');
    setEditingItemProb(0);
  };

  const saveEditItem = (categoryId: string, itemId: string) => {
    if (editingItemName.trim()) {
      handleUpdateItem(categoryId, itemId, {
        name: editingItemName.trim(),
        probability: editingItemProb / 100
      });
    }
  };

  // 删除二级活动项
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const category = config.find(c => c.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);
    if (!item) return;

    if (window.confirm(`确定要删除"${item.name}"活动吗？`)) {
      deleteActivityItem(categoryId, itemId);
      loadConfig();
      onConfigChange();
    }
  };

  // 重置为默认配置
  const handleReset = () => {
    if (window.confirm('确定要重置为默认配置吗？所有自定义设置将丢失！')) {
      resetActivityConfig();
      setEditingCategoryId(null); // 退出编辑状态
      setEditingItemId(null); // 退出活动编辑状态
      loadConfig();
      onConfigChange();
    }
  };

  // 验证并保存
  const handleSave = () => {
    if (!isConfigValid()) {
      window.alert('⚠️ 概率总和超过100%，自定义分类概率为负！请调整其他分类的概率。');
      return;
    }

    // 检查每个分类的二级活动概率总和是否与一级分类概率一致
    const mismatchCategories = config.filter(category => {
      const itemsSum = calculateItemsProbabilitySum(category.id);
      return Math.abs(itemsSum - category.totalProbability) > 0.001;
    });

    if (mismatchCategories.length > 0) {
      const messages = mismatchCategories.map(cat => {
        const itemsSum = calculateItemsProbabilitySum(cat.id);
        return `"${cat.name}": 二级分类概率总和 ${formatProbability(itemsSum)}% ≠ 一级分类概率 ${formatProbability(cat.totalProbability)}%`;
      });
      window.alert(`⚠️ 以下分类的概率不匹配：\n\n${messages.join('\n')}\n\n请先调整概率或使用自动平衡功能。`);
      return;
    }

    const validation = validateProbabilities(config);
    if (!validation.valid) {
      window.alert(validation.message);
      return;
    }

    saveActivityConfig(config);
    setError('');
    alert('保存成功！');
    onClose();
  };

  // 自动平衡概率（平均分配）
  const handleAutoBalance = () => {
    const newConfig = [...config];
    
    // 平均分配一级分类概率
    const categoryCount = newConfig.length;
    if (categoryCount > 0) {
      // 计算整数概率分配
      const basePercent = Math.floor(100 / categoryCount); // 基础概率
      const remainder = 100 - (basePercent * categoryCount); // 余数
      
      newConfig.forEach((category, catIndex) => {
        // 前remainder个分类多分配1%
        const categoryPercent = catIndex < remainder ? basePercent + 1 : basePercent;
        category.totalProbability = categoryPercent / 100;
        
        // 平均分配该分类下的活动项概率
        const itemCount = category.items.length;
        if (itemCount > 0) {
          const itemBasePercent = Math.floor(categoryPercent / itemCount);
          const itemRemainder = categoryPercent - (itemBasePercent * itemCount);
          
          category.items.forEach((item, itemIndex) => {
            const itemPercent = itemIndex < itemRemainder ? itemBasePercent + 1 : itemBasePercent;
            item.probability = itemPercent / 100;
          });
        }
      });
    }

    setConfig(newConfig);
    saveActivityConfig(newConfig);
    onConfigChange();
    setError('');
  };

  return ReactDOM.createPortal(
    <div className="activity-manager">
      <div className="activity-manager__overlay" onClick={onClose} />
      <div className="activity-manager__modal">
        <div className="activity-manager__header">
          <h2>活动配置管理</h2>
          <button 
            className="activity-manager__btn-auto" 
            onClick={handleAutoBalance}
            title="自动平衡所有概率"
          >
            ⚖️ 自动平衡
          </button>
        </div>

        <div className="activity-manager__content">
          {/* 左侧：一级分类列表 */}
          <div className="activity-manager__sidebar">
            <div className="activity-manager__sidebar-header">
              <h3>一级分类</h3>
              <button 
                className="activity-manager__btn-add-category" 
                onClick={handleAddCategory}
                title="新增分类"
              >
                ➕ 新增分类
              </button>
            </div>

            <div className="activity-manager__category-list">
              {config.map(category => {
                const isCustom = category.name === '自定义';
                const isEditing = editingCategoryId === category.id;
                const prob = formatProbability(category.totalProbability);
                const isNegative = prob < 0;
                const itemsSum = calculateItemsProbabilitySum(category.id);
                const itemsSumFormatted = formatProbability(itemsSum);
                const isProbMismatch = Math.abs(itemsSum - category.totalProbability) > 0.001;

                return (
                  <div
                    key={category.id}
                    className={`activity-manager__category-item ${selectedCategoryId === category.id ? 'active' : ''} ${isCustom ? 'custom' : ''}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {isEditing && !isCustom ? (
                      // 编辑模式（两行布局）
                      <div className="activity-manager__category-edit" onClick={e => e.stopPropagation()}>
                        <div className="activity-manager__edit-row">
                          <input
                            type="text"
                            className="activity-manager__edit-name"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            placeholder="分类名称"
                            autoFocus
                          />
                        </div>
                        <div className="activity-manager__edit-row">
                          <input
                            type="number"
                            className="activity-manager__edit-prob"
                            value={editingCategoryProb}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setEditingCategoryProb(Math.max(0, Math.min(100, val)));
                            }}
                            min="0"
                            max="100"
                            step="5"
                          />
                          <span className="activity-manager__prob-unit">%</span>
                          <button
                            className="activity-manager__btn-save-edit"
                            onClick={() => {
                              if (editingCategoryName.trim()) {
                                handleUpdateCategory(category.id, {
                                  name: editingCategoryName.trim(),
                                  totalProbability: editingCategoryProb / 100
                                });
                              }
                            }}
                          >
                            ✓
                          </button>
                          <button
                            className="activity-manager__btn-cancel-edit"
                            onClick={() => setEditingCategoryId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div className="activity-manager__category-row">
                        <span className="activity-manager__category-name">{category.name}</span>
                        <span className={`activity-manager__category-prob ${isNegative ? 'negative' : ''}`}>
                          {prob}%
                          <span className={`activity-manager__category-prob-sub ${isProbMismatch ? 'mismatch' : ''}`}>
                            ({itemsSumFormatted}%)
                          </span>
                        </span>
                        {!isCustom && (
                          <div className="activity-manager__category-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategoryId(category.id);
                                setEditingCategoryName(category.name);
                                setEditingCategoryProb(prob);
                              }}
                              title="编辑"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              title="删除"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧：二级活动项列表 */}
          <div className="activity-manager__main">
            {selectedCategory ? (
              <>
                <div className="activity-manager__main-header">
                  <div className="activity-manager__main-header-left">
                    <h3>{selectedCategory.name} - 活动列表</h3>
                    <span className="activity-manager__item-count">
                      {selectedCategory.items.length} 个活动
                    </span>
                  </div>
                  <div className="activity-manager__main-header-right">
                    <button 
                      className="activity-manager__btn-auto-balance-items" 
                      onClick={handleAutoBalanceItems}
                      title="自动平衡该分类下的活动概率"
                    >
                      ⚖️ 自动平衡
                    </button>
                    <button 
                      className="activity-manager__btn-add-item" 
                      onClick={handleAddItem}
                      title="新增活动"
                    >
                      ➕ 新增活动
                    </button>
                  </div>
                </div>

                <div className="activity-manager__item-list">
                  {selectedCategory.items.map(item => {
                    const isEditing = editingItemId === item.id;
                    
                    return (
                      <div key={item.id} className="activity-manager__item">
                        {isEditing ? (
                          // 编辑模式
                          <div className="activity-manager__item-row-edit">
                            <input
                              type="text"
                              className="activity-manager__item-name-input"
                              value={editingItemName}
                              onChange={(e) => setEditingItemName(e.target.value)}
                              placeholder="活动名称"
                              autoFocus
                            />
                            <input
                              type="number"
                              className="activity-manager__item-prob-input-edit"
                              value={editingItemProb}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setEditingItemProb(Math.max(0, Math.min(100, val)));
                              }}
                              min="0"
                              max="100"
                              step="1"
                            />
                            <span className="activity-manager__prob-unit">%</span>
                            <button
                              className="activity-manager__btn-save-item"
                              onClick={() => saveEditItem(selectedCategory.id, item.id)}
                              title="确定"
                            >
                              ✓
                            </button>
                            <button
                              className="activity-manager__btn-cancel-item"
                              onClick={cancelEditItem}
                              title="取消"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          // 显示模式
                          <div className="activity-manager__item-row">
                            <span className="activity-manager__item-name">{item.name}</span>
                            <span className="activity-manager__item-prob">
                              {formatProbability(item.probability)}%
                            </span>
                            <div className="activity-manager__item-actions">
                              <button
                                onClick={() => startEditItem(item)}
                                title="编辑"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteItem(selectedCategory.id, item.id)}
                                title="删除"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="activity-manager__empty">
                <p>请先在左侧选择或创建一个分类</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="activity-manager__error">
            ⚠️ {error}
          </div>
        )}

        <div className="activity-manager__footer">
          <button className="activity-manager__btn-reset" onClick={handleReset}>
            重置为默认
          </button>
          <div className="activity-manager__footer-actions">
            <button className="activity-manager__btn-cancel" onClick={onClose}>
              取消
            </button>
            <button className="activity-manager__btn-save" onClick={handleSave}>
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActivityManager;
