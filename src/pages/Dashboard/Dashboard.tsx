import React, { useState, useEffect } from 'react';
import { RecordsContent, SleepRecordsContent, StudyRecordsContent, DailyRecordsContent } from '@/components/dashboard';
import { RecordType } from '@/utils';
import './Dashboard.scss';

type DashboardTab = 'records' | 'sleep' | 'study' | 'daily';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    // 从URL参数读取初始tab
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const tab = params.get('tab') as DashboardTab;
    return tab && ['records', 'sleep', 'study', 'daily'].includes(tab) ? tab : 'records';
  });

  const [recordType, setRecordType] = useState<RecordType>(() => {
    // 从URL参数读取初始类型
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const type = params.get('type');
    return type === 'income' ? RecordType.INCOME : RecordType.EXPENSE;
  });

  // 监听URL变化并更新状态
  useEffect(() => {
    const handleHashChange = () => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const tab = params.get('tab') as DashboardTab;
      const type = params.get('type');
      
      if (tab && ['records', 'sleep', 'study', 'daily'].includes(tab)) {
        setActiveTab(tab);
      }
      
      if (type && (type === 'income' || type === 'expense')) {
        setRecordType(type === 'income' ? RecordType.INCOME : RecordType.EXPENSE);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 更新URL参数（仅在状态变化时）
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const currentTab = params.get('tab');
    const currentType = params.get('type');
    
    const expectedType = recordType === RecordType.EXPENSE ? 'expense' : 'income';
    
    // 只有当URL参数与当前状态不一致时才更新URL
    if (currentTab !== activeTab || (activeTab === 'records' && currentType !== expectedType)) {
      const newParams = new URLSearchParams();
      newParams.set('tab', activeTab);
      if (activeTab === 'records') {
        newParams.set('type', expectedType);
      }
      // 使用replaceState避免创建历史记录
      const newHash = `#/dashboard?${newParams.toString()}`;
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }
  }, [activeTab, recordType]);

  // 返回首页（根据当前看板跳转到对应的记录页面）
  const goToHome = () => {
    // 将Dashboard的tab映射到Home的mode
    const modeMap: Record<DashboardTab, string> = {
      'records': 'accounting',
      'sleep': 'sleep',
      'study': 'study',
      'daily': 'daily'
    };
    
    const mode = modeMap[activeTab];
    window.location.hash = `#/?mode=${mode}`;
  };

  // 切换记录类型（仅账单记录）
  const toggleRecordType = () => {
    setRecordType(recordType === RecordType.EXPENSE ? RecordType.INCOME : RecordType.EXPENSE);
  };

  // 获取当前tab的标题和描述
  const getTabInfo = (tab: DashboardTab) => {
    switch (tab) {
      case 'records':
        return {
          title: `${recordType === RecordType.EXPENSE ? '💰' : '📈'} ${recordType === RecordType.EXPENSE ? '支出' : '收入'}数据面板`,
          description: `一目了然的${recordType === RecordType.EXPENSE ? '支出' : '收入'}分析`
        };
      case 'sleep':
        return {
          title: '🌙 睡眠数据面板',
          description: '查看你的睡眠统计与趋势分析'
        };
      case 'study':
        return {
          title: '📚 学习数据面板',
          description: '记录成长，见证进步'
        };
      case 'daily':
        return {
          title: '📝 日常数据面板',
          description: '全方位了解你的日常生活状态'
        };
    }
  };

  const tabInfo = getTabInfo(activeTab);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        {/* 统一的tab切换容器 */}
        <div className="dashboard__tabs-container">
          {/* 页面模式切换按钮 */}
          <div className="dashboard__mode-switcher">
            <button
              className={`mode-btn ${activeTab === 'records' ? 'mode-btn--active' : ''}`}
              onClick={() => setActiveTab('records')}
            >
              💰 账单面板
            </button>
            <button
              className={`mode-btn ${activeTab === 'sleep' ? 'mode-btn--active' : ''}`}
              onClick={() => setActiveTab('sleep')}
            >
              🌙 睡眠面板
            </button>
            <button
              className={`mode-btn ${activeTab === 'study' ? 'mode-btn--active' : ''}`}
              onClick={() => setActiveTab('study')}
            >
              📚 学习面板
            </button>
            <button
              className={`mode-btn ${activeTab === 'daily' ? 'mode-btn--active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              📝 日常面板
            </button>
          </div>
        </div>

        {/* 标题和描述 */}
        <div className="dashboard__title-section">
          <h1>{tabInfo.title}</h1>
          <p>{tabInfo.description}</p>
        </div>

        {/* 右侧按钮区域 */}
        <div className="dashboard__actions">
          {/* 切换按钮 - 仅账单记录显示 */}
          {activeTab === 'records' && (
            <button
              className="dashboard__toggle-btn"
              onClick={toggleRecordType}
              title={`切换到${recordType === RecordType.EXPENSE ? '收入' : '支出'}看板`}
            >
              {recordType === RecordType.EXPENSE ? '📈' : '💰'} 切到{recordType === RecordType.EXPENSE ? '收入' : '支出'}
            </button>
          )}
          {/* 返回首页按钮 */}
          <button className="dashboard__back-btn" onClick={goToHome}>
          ⏎ 返回首页
          </button>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="dashboard__content">
        {activeTab === 'records' && (
          <RecordsContent recordType={recordType} onRecordTypeChange={setRecordType} />
        )}
        {activeTab === 'sleep' && <SleepRecordsContent />}
        {activeTab === 'study' && <StudyRecordsContent />}
        {activeTab === 'daily' && <DailyRecordsContent />}
      </div>
    </div>
  );
};

export default Dashboard;

