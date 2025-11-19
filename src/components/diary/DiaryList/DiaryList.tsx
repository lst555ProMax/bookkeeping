import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { DiaryEntry, WEATHER_OPTIONS, MOOD_OPTIONS } from '@/utils';
import './DiaryList.scss';

interface DiaryListProps {
  diaryEntries: DiaryEntry[];
  currentDiaryId: string | null;
  onLoadDiary: (entry: DiaryEntry) => void;
  onDeleteDiary: (id: string) => void;
  onImportAll?: (entries: DiaryEntry[]) => void;
  onDeleteAll?: () => void;
  searchContent?: string;
  onSearchContentChange?: (value: string) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({
  diaryEntries,
  currentDiaryId,
  onLoadDiary,
  onDeleteDiary,
  onImportAll,
  onDeleteAll,
  searchContent = '',
  onSearchContentChange,
}) => {
  const [exportMenuOpenId, setExportMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setExportMenuOpenId(null);
      }
    };

    if (exportMenuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpenId]);

  // 格式化日期为 yyyy.mm.dd
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 格式化创建时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 导出功能
  const handleExport = async (entry: DiaryEntry, format: 'txt' | 'doc' | 'pdf' | 'md') => {
    setExportMenuOpenId(null);
    
    // 从HTML中提取纯文本
    const plainTextContent = getTextFromHTML(entry.content);
    const content = `# ${formatDate(entry.date)} ${formatTime(entry.createdAt)}\n\n天气: ${entry.weather}\n心情: ${entry.mood}\n\n${plainTextContent}`;
    
    try {
      if (format === 'txt') {
        // 导出为txt
        const blob = new Blob([plainTextContent], { type: 'text/plain;charset=utf-8' });
        downloadFile(blob, `日记_${formatDate(entry.date)}.txt`);
      } else if (format === 'md') {
        // 导出为markdown
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        downloadFile(blob, `日记_${formatDate(entry.date)}.md`);
      } else if (format === 'doc') {
        // 导出为doc（使用HTML内容保留格式）
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>日记</title></head>
          <body>
            <h1>${formatDate(entry.date)} ${formatTime(entry.createdAt)}</h1>
            <p>天气: ${entry.weather}</p>
            <p>心情: ${entry.mood}</p>
            <hr/>
            <div>${entry.content}</div>
          </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
        downloadFile(blob, `日记_${formatDate(entry.date)}.doc`);
      } else if (format === 'pdf') {
        // PDF导出需要特殊处理，这里先提示用户
        toast('PDF导出功能需要额外的库支持，当前版本建议使用浏览器的"打印-另存为PDF"功能', { duration: 4000 });
      }
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请重试');
    }
  };

  // 下载文件
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导出所有日记为JSON
  const handleExportAll = () => {
    if (diaryEntries.length === 0) {
      toast('没有日记可以导出', { icon: '⚠️' });
      return;
    }

    const jsonData = JSON.stringify(diaryEntries, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
    const date = new Date();
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    downloadFile(blob, `日记导出_${dateStr}.json`);
  };

  // 导入日记
  const handleImportAll = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!Array.isArray(data)) {
          toast.error('导入文件格式错误');
          return;
        }

        // 验证数据格式
        const isValid = data.every(entry => 
          entry.id && entry.date && entry.content
        );

        if (!isValid) {
          toast.error('导入文件数据格式不正确');
          return;
        }

        if (onImportAll) {
          onImportAll(data);
          toast.success(`成功导入 ${data.length} 篇日记`);
        }
      } catch (error) {
        console.error('导入失败:', error);
        toast.error('导入失败，请检查文件格式');
      }
    };
    input.click();
  };

  // 删除所有日记
  const handleDeleteAll = () => {
    if (diaryEntries.length === 0) {
      toast('没有日记可以删除', { icon: '⚠️' });
      return;
    }

    const confirmed = window.confirm(
      `确定要删除所有 ${diaryEntries.length} 篇日记吗？\n\n此操作无法撤销！建议先导出备份。`
    );

    if (confirmed && onDeleteAll) {
      onDeleteAll();
    }
  };

  // 从 HTML 中提取纯文本
  const getTextFromHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="diary-list">
      <div className="diary-list__header">
        <h3 className="diary-list__title">📚 日记 ({diaryEntries.length})</h3>
        {onSearchContentChange && (
          <div className="diary-list__search">
            <input
              type="text"
              className="search-input search-input--text"
              placeholder="搜索内容..."
              value={searchContent}
              onChange={(e) => onSearchContentChange(e.target.value)}
            />
          </div>
        )}
        <div className="diary-list__actions">
          <button 
            className="action-icon-btn"
            onClick={handleExportAll}
            title="导出所有日记为JSON"
          >
            📤
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleImportAll}
            title="从JSON导入日记"
          >
            📥
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleDeleteAll}
            title="删除所有日记"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="diary-list__items">
        {diaryEntries.map(entry => (
          <div 
            key={entry.id} 
            className={`diary-item ${entry.id === currentDiaryId ? 'diary-item--active' : ''}`}
            onClick={() => onLoadDiary(entry)}
            style={{ 
              backgroundColor: entry.theme || '#f8f9fa',
            }}
          >
            <div className="diary-item__header">
              <div className="diary-item__left">
                <span className="diary-item__date">
                  📅 {formatDate(entry.date)} {formatTime(entry.createdAt)}
                </span>
                {entry.weather && (
                  <span className="diary-item__weather">
                    {WEATHER_OPTIONS.find(w => w.label === entry.weather)?.icon}
                  </span>
                )}
                {entry.mood && (
                  <span className="diary-item__mood">
                    {MOOD_OPTIONS.find(m => m.label === entry.mood)?.icon}
                  </span>
                )}
              </div>
              <div className="diary-item__actions">
                <div className="export-dropdown" ref={exportMenuOpenId === entry.id ? menuRef : null}>
                  <button 
                    className="diary-item__export"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExportMenuOpenId(exportMenuOpenId === entry.id ? null : entry.id);
                    }}
                    title="导出"
                  >
                    📤
                  </button>
                  {exportMenuOpenId === entry.id && (
                    <div className="export-menu">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleExport(entry, 'txt');
                      }}>
                        📄 TXT
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleExport(entry, 'doc');
                      }}>
                        📝 DOC
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleExport(entry, 'pdf');
                      }}>
                        📕 PDF
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleExport(entry, 'md');
                      }}>
                        📋 MD
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  className="diary-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDiary(entry.id);
                  }}
                  title="删除记录"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div 
              className="diary-item__preview"
              style={{ 
                fontFamily: entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif"
              }}
            >
              {getTextFromHTML(entry.content).substring(0, 100)}
              {getTextFromHTML(entry.content).length > 100 && '...'}
            </div>
          </div>
        ))}
        {diaryEntries.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📖</div>
            <p>还没有日记哦</p>
            <p className="empty-state__hint">在中间写下你的第一篇日记吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryList;
