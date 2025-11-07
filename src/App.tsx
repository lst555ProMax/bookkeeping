import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Records, SleepRecords, DailyRecords, StudyRecords } from '@/pages';
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
      case 'studyRecords':
        return <StudyRecords />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '500',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#52c41a',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ff4d4f',
              secondary: '#fff',
            },
          },
        }}
      />
      {renderPage()}
    </div>
  );
};

export default App;