import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BusinessMode, BUSINESS_MODE_LABELS } from '@/types';
import { loadMenuConfig, saveMenuConfig, getAllMenuOptions } from '@/utils';
import { DataType, importSampleData, hasLocalData, getStorageKey } from '@/utils';
import './MenuSettings.scss';

interface MenuSettingsProps {
  onClose: () => void;
  onConfigChange: () => void;
}

const MenuSettings: React.FC<MenuSettingsProps> = ({ onClose, onConfigChange }) => {
  const [selectedMenus, setSelectedMenus] = useState<BusinessMode[]>([]);
  const [useSampleData, setUseSampleData] = useState<Record<BusinessMode, boolean>>({
    [BusinessMode.ACCOUNTING]: false,
    [BusinessMode.SLEEP]: false,
    [BusinessMode.DAILY]: false,
    [BusinessMode.STUDY]: false,
    [BusinessMode.SOFTWARE]: false,
  });
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    // 加载当前配置
    const config = loadMenuConfig();
    setSelectedMenus(config);
  }, []);

  // 切换菜单选中状态
  const handleToggleMenu = (mode: BusinessMode) => {
    setSelectedMenus(prev => {
      if (prev.includes(mode)) {
        // 移除
        return prev.filter(m => m !== mode);
      } else {
        // 添加
        return [...prev, mode];
      }
    });
  };

  // 切换示例数据选中状态
  const handleToggleSampleData = (mode: BusinessMode, checked: boolean) => {
    setUseSampleData(prev => ({
      ...prev,
      [mode]: checked
    }));
  };

  // 获取数据类型映射
  const getDataType = (mode: BusinessMode): DataType | null => {
    const mapping: Record<BusinessMode, DataType> = {
      [BusinessMode.ACCOUNTING]: DataType.ACCOUNTING,
      [BusinessMode.SLEEP]: DataType.SLEEP,
      [BusinessMode.DAILY]: DataType.DAILY,
      [BusinessMode.STUDY]: DataType.STUDY,
      [BusinessMode.SOFTWARE]: DataType.BROWSER,
    };
    return mapping[mode] || null;
  };

  // 导入单个模块的示例数据
  const importModuleSampleData = async (mode: BusinessMode): Promise<boolean> => {
    const dataType = getDataType(mode);
    if (!dataType) return false;

    const storageKey = getStorageKey(dataType);
    const hasData = hasLocalData(storageKey);

    if (hasData) {
      const confirmed = window.confirm(
        `检测到 ${BUSINESS_MODE_LABELS[mode]} 已有数据，是否覆盖现有数据？\n\n⚠️ 此操作将清空当前数据！`
      );
      if (!confirmed) {
        return false;
      }
    }

    try {
      await importSampleData(dataType, storageKey, true);
      return true;
    } catch (error) {
      console.error(`Failed to import sample data for ${mode}:`, error);
      alert(`导入 ${BUSINESS_MODE_LABELS[mode]} 示例数据失败，请稍后重试。`);
      return false;
    }
  };

  // 保存配置
  const handleSave = async () => {
    if (selectedMenus.length === 0) {
      alert('⚠️ 至少需要选择一个菜单！');
      return;
    }

    setImporting(true);

    try {
      // 导入选中的示例数据
      const importPromises: Promise<boolean>[] = [];
      const modulesToImport: BusinessMode[] = [];

      for (const mode of selectedMenus) {
        if (useSampleData[mode]) {
          modulesToImport.push(mode);
          importPromises.push(importModuleSampleData(mode));
        }
      }

      if (importPromises.length > 0) {
        const results = await Promise.all(importPromises);
        const successCount = results.filter(r => r).length;
        
        if (successCount > 0) {
          alert(`✅ 成功导入 ${successCount} 个模块的示例数据！`);
        }
      }

      // 保存菜单配置
      saveMenuConfig(selectedMenus);
      onConfigChange();
      onClose();
    } catch (error) {
      console.error('Error during save:', error);
      alert('保存配置时出现错误，请稍后重试。');
    } finally {
      setImporting(false);
    }
  };

  // 获取菜单emoji
  const getMenuEmoji = (mode: BusinessMode): string => {
    const emojiMap: Record<BusinessMode, string> = {
      [BusinessMode.ACCOUNTING]: '💰',
      [BusinessMode.SLEEP]: '🌙',
      [BusinessMode.DAILY]: '📝',
      [BusinessMode.STUDY]: '📚',
      [BusinessMode.SOFTWARE]: '💻',
    };
    return emojiMap[mode] || '📋';
  };

  const allOptions = getAllMenuOptions();

  return ReactDOM.createPortal(
    <div className="menu-settings">
      <div className="menu-settings__overlay" onClick={onClose} />
      <div className="menu-settings__modal">
        <div className="menu-settings__header">
          <h2>⚙️ 菜单设置</h2>
          <button className="menu-settings__close" onClick={onClose}>✕</button>
        </div>

        <div className="menu-settings__content">
          <div className="menu-settings__description">
            <span>选择你想要在首页显示的菜单项：</span>
            <span className="menu-settings__description-hint">使用示例数据</span>
          </div>

          <div className="menu-settings__options">
            {allOptions.map(mode => (
              <label 
                key={mode}
                className={`menu-settings__option ${selectedMenus.includes(mode) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedMenus.includes(mode)}
                  onChange={() => handleToggleMenu(mode)}
                  className="menu-settings__option-checkbox"
                />
                <span className="menu-settings__option-emoji">{getMenuEmoji(mode)}</span>
                <span className="menu-settings__option-label">
                  {BUSINESS_MODE_LABELS[mode]}
                  {selectedMenus.includes(mode) && (
                    <span className="menu-settings__option-check">✓</span>
                  )}
                </span>
                
                {/* 示例数据复选框 */}
                <label 
                  className="menu-settings__sample-data"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={useSampleData[mode]}
                    onChange={(e) => handleToggleSampleData(mode, e.target.checked)}
                    className="menu-settings__sample-data-checkbox"
                  />
                </label>
              </label>
            ))}
          </div>
        </div>

        <div className="menu-settings__footer">
          <button 
            className="menu-settings__btn-cancel" 
            onClick={onClose}
            disabled={importing}
          >
            取消
          </button>
          <button 
            className="menu-settings__btn-save" 
            onClick={handleSave}
            disabled={importing}
          >
            {importing ? '导入中...' : '保存'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuSettings;
