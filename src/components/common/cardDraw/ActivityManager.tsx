import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import { ActivityCategoryConfig, ActivityItem, CardType, CardCategory } from '@/utils';
import {
  loadActivityConfig,
  saveActivityConfig,
  resetActivityConfig,
  addActivityCategory,
  deleteActivityCategory,
  addActivityItem,
  updateActivityItem,
  deleteActivityItem
} from '@/utils';
import './ActivityManager.scss';

interface ActivityManagerProps {
  onClose: () => void;
  onConfigChange: () => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ onClose, onConfigChange }) => {
  const [config, setConfig] = useState<ActivityCategoryConfig[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // 共享的编辑状态：{ type: 'category' | 'item', id: string } | null
  const [editing, setEditing] = useState<{ type: 'category' | 'item'; id: string } | null>(null);
  const [error, setError] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryProb, setEditingCategoryProb] = useState(0);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemProb, setEditingItemProb] = useState(0);

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC退出绑定（在捕获阶段处理，优先于今日活动界面）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // 阻止事件传播到今日活动界面
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true); // 使用捕获阶段
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  const loadConfig = () => {
    const loaded = loadActivityConfig();
    setConfig(loaded);
    if (loaded.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(loaded[0].id);
    }
    return loaded;
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
    // 检查一级分类数量限制（最多20个）
    if (config.length >= 20) {
      toast.error('一级分类最多只能创建20个，无法继续添加');
      return;
    }

    // 生成唯一的名称：分类、分类1、分类2...
    let categoryName = '分类';
    let counter = 1;
    while (config.some(c => c.name === categoryName)) {
      categoryName = `分类${counter}`;
      counter++;
    }

    const categoryEnum = CardCategory.CUSTOM; // 新建的都是自定义类型
    addActivityCategory(categoryName, categoryEnum);
    setError('');
    const newConfig = loadConfig();
    // 新建后默认选中第一个分类
    if (newConfig.length > 0) {
      setSelectedCategoryId(newConfig[0].id);
    }
    onConfigChange();
    toast.success('新增成功！');
  };

  // 更新一级分类
  const handleUpdateCategory = (id: string, updates: Partial<ActivityCategoryConfig>) => {
    // 验证分类名称长度
    if (updates.name && updates.name.trim().length > 4) {
      toast.error('分类名称不能超过4个字');
      return;
    }

    // 检查一级分类名称是否与其他一级分类重名（排除自己）
    if (updates.name) {
      const trimmedName = updates.name.trim();
      const duplicateCategory = config.find(c => c.id !== id && c.name === trimmedName);
      if (duplicateCategory) {
        toast.error(`分类名称"${trimmedName}"已存在，请使用其他名称`);
        return;
      }
    }

    const newConfig = config.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    
    // 重新计算自定义概率
    const updated = calculateCustomProbability(newConfig);
    setConfig(updated);
    saveActivityConfig(updated);
    onConfigChange();
    setEditing(null);
    toast.success('保存成功！');
  };

  // 删除一级分类
  const handleDeleteCategory = (id: string) => {
    const category = config.find(c => c.id === id);
    if (!category) return;

    const itemCount = category.items.length;
    const message = itemCount > 0
      ? `确定要删除"${category.name}"分类吗？该分类下的 ${itemCount} 个活动也将被删除。`
      : `确定要删除"${category.name}"分类吗？`;

    if (confirm(message)) {
      deleteActivityCategory(id);
      loadConfig();
      onConfigChange();
      if (selectedCategoryId === id) {
        const newConfig = config.filter(c => c.id !== id);
        setSelectedCategoryId(newConfig[0]?.id || null);
      }
      toast.success(' 删除成功！');
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

    // 检查二级分类数量限制（最多20个）
    if (category.items.length >= 20) {
      toast.error('每个一级分类下的二级分类最多只能创建20个');
      return;
    }

    let itemName = '新活动';
    let counter = 1;
    while (category.items.some(item => item.name === itemName)) {
      itemName = `新活动${counter}`;
      counter++;
    }

    addActivityItem(selectedCategoryId, itemName, CardType.CUSTOM);
    setError('');
    loadConfig();
    onConfigChange();
    toast.success('新增成功！');
  };

  // 自动平衡当前分类的二级活动概率
  const handleAutoBalanceItems = () => {
    if (!selectedCategoryId) return;

    const category = config.find(c => c.id === selectedCategoryId);
    if (!category) return;
    
    if (category.items.length === 0) {
      toast('当前分类没有活动项，请先添加活动', { icon: '⚠️' });
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
    toast.success(' 自动平衡成功！');
  };

  // 更新二级活动项
  const handleUpdateItem = (categoryId: string, itemId: string, updates: Partial<ActivityItem>) => {
    updateActivityItem(categoryId, itemId, updates);
    loadConfig();
    onConfigChange();
    setEditing(null);
    toast.success('保存成功！');
  };

  // 开始编辑二级活动项
  const startEditItem = (item: ActivityItem) => {
    setEditing({ type: 'item', id: item.id });
    setEditingItemName(item.name);
    setEditingItemProb(formatProbability(item.probability));
  };

  const cancelEditItem = () => {
    setEditing(null);
    setEditingItemName('');
    setEditingItemProb(0);
  };

  const saveEditItem = (categoryId: string, itemId: string) => {
    if (!editingItemName.trim()) {
      toast.error('活动名称不能为空');
      return;
    }

    if (editingItemName.trim().length > 5) {
      toast.error('活动名称不能超过5个字');
      return;
    }

    // 检查二级活动项名称是否与同一分类下的其他活动项重名（排除自己）
    const category = config.find(c => c.id === categoryId);
    if (category) {
      const trimmedName = editingItemName.trim();
      const duplicateItem = category.items.find(item => item.id !== itemId && item.name === trimmedName);
      if (duplicateItem) {
        toast.error(`活动名称"${trimmedName}"已存在于当前分类中，请使用其他名称`);
        return;
      }
    }

    handleUpdateItem(categoryId, itemId, {
      name: editingItemName.trim(),
      probability: editingItemProb / 100
    });
  };

  // 保存一级分类编辑
  const saveEditCategory = (categoryId: string) => {
    if (editingCategoryName.trim()) {
      handleUpdateCategory(categoryId, {
        name: editingCategoryName.trim(),
        totalProbability: editingCategoryProb / 100
      });
    }
  };

  // 处理一级分类编辑时的键盘事件
  const handleCategoryKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      saveEditCategory(categoryId);
    }
  };

  // 处理二级活动项编辑时的键盘事件
  const handleItemKeyDown = (e: React.KeyboardEvent, categoryId: string, itemId: string) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      saveEditItem(categoryId, itemId);
    }
  };

  // 删除二级活动项
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const category = config.find(c => c.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);
    if (!item || !category) return;

    if (confirm(`确定要删除"${item.name}"活动吗？`)) {
      deleteActivityItem(categoryId, itemId);
      loadConfig();
      onConfigChange();
      
      // 如果正在编辑这个项目，退出编辑状态
      if (editing?.type === 'item' && editing.id === itemId) {
        setEditing(null);
      }
      toast.success(' 删除成功！');
    }
  };

  // 重置为默认配置
  const handleReset = () => {
    if (confirm('确定要重置为默认配置吗？\n\n所有自定义设置将丢失且无法恢复！')) {
      resetActivityConfig();
      setEditing(null); // 退出编辑状态
      setError(''); // 清空错误信息
      loadConfig();
      onConfigChange();
      toast.success(' 重置成功！');
    }
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
    toast.success(' 自动平衡成功！');
  };

  return ReactDOM.createPortal(
    <div className="activity-manager">
      <div className="activity-manager__overlay" onClick={onClose} />
      <div className="activity-manager__modal">
        <div className="activity-manager__header">
          <h2>活动配置管理</h2>
          <div className="activity-manager__header-actions">
            <button 
              className="activity-manager__btn-reset" 
              onClick={handleReset}
              title="重置为默认"
            >
              🔄
            </button>
            <button 
              className="activity-manager__btn-auto" 
              onClick={handleAutoBalance}
              title="自动平衡所有概率"
            >
              ⚖️
            </button>
            <button 
              className="activity-manager__btn-close" 
              onClick={onClose}
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="activity-manager__content">
          {/* 左侧：一级分类列表 */}
          <div className="activity-manager__sidebar">
            <div className="activity-manager__sidebar-header">
              <div className="activity-manager__sidebar-header-left">
                <h3>一级分类</h3>
                <span className="activity-manager__item-count">
                  {config.length}个分类，共{config.reduce((sum, cat) => sum + cat.items.length, 0)}个活动
                </span>
              </div>
              <button 
                className="activity-manager__btn-add-category" 
                onClick={handleAddCategory}
                title="新增分类"
              >
                ➕
              </button>
            </div>

            <div className="activity-manager__category-list">
              {config.map(category => {
                const isCustom = category.name === '自定义';
                const isEditing = editing?.type === 'category' && editing.id === category.id;
                const prob = formatProbability(category.totalProbability);
                const isNegative = prob < 0;
                const itemsSum = calculateItemsProbabilitySum(category.id);
                const itemsSumFormatted = formatProbability(itemsSum);
                const isProbMismatch = Math.abs(itemsSum - category.totalProbability) > 0.001;

                return (
                  <div
                    key={category.id}
                    className={`activity-manager__category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {isEditing && !isCustom ? (
                      // 编辑模式（一行布局）
                      <div className="activity-manager__category-edit" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          className="activity-manager__edit-name"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
                          placeholder="分类名称（最多4个字）"
                          maxLength={4}
                          autoFocus
                        />
                        <input
                          type="number"
                          className="activity-manager__edit-prob"
                          value={editingCategoryProb}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setEditingCategoryProb(Math.max(0, Math.min(100, val)));
                          }}
                          onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
                          min="0"
                          max="100"
                          step="5"
                        />
                        <button
                          className="activity-manager__btn-cancel-edit"
                          onClick={() => setEditing(null)}
                        >
                          ❌
                        </button>
                        <button
                          className="activity-manager__btn-save-edit"
                          onClick={() => saveEditCategory(category.id)}
                        >
                          💾
                        </button>
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
                                setEditing({ type: 'category', id: category.id });
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
                    <h3>二级分类 - {selectedCategory.name}</h3>
                    <span className="activity-manager__item-count">
                      {selectedCategory.items.length} 个活动
                    </span>
                  </div>
                  {/* 自定义分类的二级活动项中，隐藏添加和平衡按钮 */}
                  {selectedCategory.name !== '自定义' && (
                    <div className="activity-manager__main-header-right">
                      <button 
                        className="activity-manager__btn-auto-balance-items" 
                        onClick={handleAutoBalanceItems}
                        title="自动平衡该分类下的活动概率"
                      >
                        ⚖️
                      </button>
                      <button 
                        className="activity-manager__btn-add-item" 
                        onClick={handleAddItem}
                        title="新增活动"
                      >
                        ➕
                      </button>
                    </div>
                  )}
                </div>

                <div className="activity-manager__item-list">
                  {selectedCategory.items.map(item => {
                    const isEditing = editing?.type === 'item' && editing.id === item.id;
                    const isCustomCategory = selectedCategory.name === '自定义';
                    
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
                              onKeyDown={(e) => handleItemKeyDown(e, selectedCategory.id, item.id)}
                              placeholder="活动名称（最多5个字）"
                              maxLength={5}
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
                              onKeyDown={(e) => handleItemKeyDown(e, selectedCategory.id, item.id)}
                              min="0"
                              max="100"
                              step="1"
                            />
                            <button
                              className="activity-manager__btn-cancel-item"
                              onClick={cancelEditItem}
                              title="取消"
                            >
                              ❌
                            </button>
                            <button
                              className="activity-manager__btn-save-item"
                              onClick={() => saveEditItem(selectedCategory.id, item.id)}
                              title="确定"
                            >
                              💾
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
                              {/* 自定义分类的二级活动项中，隐藏删除按钮 */}
                              {!isCustomCategory && (
                                <button
                                  onClick={() => handleDeleteItem(selectedCategory.id, item.id)}
                                  title="删除"
                                >
                                  🗑️
                                </button>
                              )}
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
      </div>
    </div>,
    document.body
  );
};

export default ActivityManager;
