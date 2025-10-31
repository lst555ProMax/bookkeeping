import React, { useState, useEffect } from 'react';
import { Home, Records, SleepRecords, DailyRecords } from '@/pages';
import { getCurrentPath, findRouteByPath } from '@/router';
import './App.scss';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // 监听hash变化来实现简单路由
  useEffect(() => {
    const handleHashChange = () => {
      const path = getCurrentPath();
      const route = findRouteByPath(path);
      
      if (route) {
        setCurrentPage(route.name);
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化时检查hash
    handleHashChange();

    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 渲染对应的页面
  const renderPage = () => {
    switch (currentPage) {
      case 'records':
        return <Records />;
      case 'sleepRecords':
        return <SleepRecords />;
      case 'dailyRecords':
        return <DailyRecords />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
};

export default App;