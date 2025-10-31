import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BusinessMode, BUSINESS_MODE_LABELS } from '@/types';
import { loadMenuConfig, saveMenuConfig, getAllMenuOptions } from '@/utils';
import './MenuSettings.scss';

interface MenuSettingsProps {
  onClose: () => void;
  onConfigChange: () => void;
}

const MenuSettings: React.FC<MenuSettingsProps> = ({ onClose, onConfigChange }) => {
  const [selectedMenus, setSelectedMenus] = useState<BusinessMode[]>([]);

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

  // 保存配置
  const handleSave = () => {
    if (selectedMenus.length === 0) {
      alert('⚠️ 至少需要选择一个菜单！');
      return;
    }

    saveMenuConfig(selectedMenus);
    onConfigChange();
    alert('✅ 保存成功！');
    onClose();
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
          <p className="menu-settings__description">
            选择你想要在首页显示的菜单项：
          </p>

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
                />
                <span className="menu-settings__option-emoji">{getMenuEmoji(mode)}</span>
                <span className="menu-settings__option-label">{BUSINESS_MODE_LABELS[mode]}</span>
                <span className="menu-settings__option-check">✓</span>
              </label>
            ))}
          </div>
        </div>

        <div className="menu-settings__footer">
          <button className="menu-settings__btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className="menu-settings__btn-save" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuSettings;
