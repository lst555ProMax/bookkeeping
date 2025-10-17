import React, { useState, useEffect } from 'react';
import { Home, Records, SleepRecords } from '@/pages';
import './App.scss';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // 监听hash变化来实现简单路由
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/records') {
        setCurrentPage('records');
      } else if (hash === '#/sleep-records') {
        setCurrentPage('sleep-records');
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
      case 'sleep-records':
        return <SleepRecords />;
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