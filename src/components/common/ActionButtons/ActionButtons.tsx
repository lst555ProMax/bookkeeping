import React from 'react';
import './ActionButtons.scss';

interface ActionButtonsProps {
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false,
  className = ''
}) => {
  if (!onViewDashboard && !onExport && !onImport && !onClear) {
    return null;
  }

  return (
    <div className={`action-buttons ${className}`}>
      {onViewDashboard && (
        <button 
          className="action-icon-btn" 
          onClick={onViewDashboard}
          title="查看数据面板"
        >
          📊
        </button>
      )}
      {onExport && (
        <button 
          className="action-icon-btn action-icon-btn--export" 
          onClick={onExport}
          title="导出数据"
        >
          📤
        </button>
      )}
      {onImport && (
        <button 
          className="action-icon-btn action-icon-btn--import" 
          onClick={onImport}
          disabled={isImporting}
          title={isImporting ? "导入中..." : "导入数据"}
        >
          📥
        </button>
      )}
      {onClear && (
        <button 
          className="action-icon-btn action-icon-btn--danger" 
          onClick={onClear}
          title="清空数据"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default ActionButtons;

