import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Dashboard } from '@/pages';
import { getCurrentPath, findRouteByPath } from '@/router';
import { FloatingQuickNote } from '@/components/common';
import { addQuickNote } from '@/utils/diary/storage';
import './App.scss';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // 处理添加速记
  const handleAddQuickNote = (content: string) => {
    addQuickNote(content);
    // 触发自定义事件通知日记页面更新
    window.dispatchEvent(new CustomEvent('quickNoteAdded'));
  };

  // 监听hash变化来实现简单路由
  useEffect(() => {
    const handleHashChange = () => {
      const path = getCurrentPath();
      const route = findRouteByPath(path);
      
      if (route) {
        // 处理旧路由重定向到dashboard
        if (['records', 'sleepRecords', 'dailyRecords', 'studyRecords'].includes(route.name)) {
          const params = new URLSearchParams();
          const tabMap: Record<string, string> = {
            'records': 'records',
            'sleepRecords': 'sleep',
            'dailyRecords': 'daily',
            'studyRecords': 'study'
          };
          params.set('tab', tabMap[route.name] || 'records');
          
          // 如果是records路由，检查是否有type参数
          if (route.name === 'records') {
            const oldParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const type = oldParams.get('type');
            if (type) {
              params.set('type', type);
            }
          }
          
          window.location.hash = `#/dashboard?${params.toString()}`;
          return;
        }
        
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
      case 'dashboard':
      case 'records':
      case 'sleepRecords':
      case 'dailyRecords':
      case 'studyRecords':
        return <Dashboard />;
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
        containerStyle={{
          zIndex: 10000, // 确保 toast 容器层级高于 ActivityManager (9999)
        }}
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
      {/* 全局悬浮球 */}
      <FloatingQuickNote onAddQuickNote={handleAddQuickNote} />
    </div>
  );
};

export default App;