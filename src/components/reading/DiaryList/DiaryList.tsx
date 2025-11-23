import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { DiaryEntry, WEATHER_OPTIONS, MOOD_OPTIONS } from '@/utils';
import { FilterSearchInput } from '@/components/common';
import './DiaryList.scss';

interface DiaryListProps {
  diaryEntries: DiaryEntry[];
  currentDiaryId: string | null;
  onLoadDiary: (entry: DiaryEntry) => void;
  onDeleteDiary: (id: string) => void;
  onExportAll?: () => void;
  onImportAll?: () => void;
  onDeleteAll?: () => void;
  searchContent?: string;
  onSearchContentChange?: (value: string) => void;
  isImporting?: boolean;
}

const DiaryList: React.FC<DiaryListProps> = ({
  diaryEntries,
  currentDiaryId,
  onLoadDiary,
  onDeleteDiary,
  onExportAll,
  onImportAll,
  onDeleteAll,
  searchContent = '',
  onSearchContentChange,
  isImporting: _isImporting = false,
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
    
    try {
      if (format === 'txt') {
        // 导出为txt（纯文本，不包含图片）
        const blob = new Blob([plainTextContent], { type: 'text/plain;charset=utf-8' });
        downloadFile(blob, `书记_${formatDate(entry.date)}.txt`);
      } else if (format === 'md') {
        // 导出为markdown（包含图片）
        let mdContent = `# ${formatDate(entry.date)} ${formatTime(entry.createdAt)}\n\n`;
        mdContent += `**天气:** ${entry.weather}\n\n`;
        mdContent += `**心情:** ${entry.mood}\n\n`;
        
        // 如果有图片，添加图片到markdown
        if (entry.image) {
          const imageSrc = entry.image.startsWith('data:image/') 
            ? entry.image 
            : `data:image/png;base64,${entry.image}`;
          
          mdContent += `<img src="${imageSrc}" alt="日记图片" style="max-width: 100%; height: auto; border-radius: 8px;" />\n\n`;
          mdContent += `---\n\n`;
        }
        
        mdContent += `${plainTextContent}`;
        
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        downloadFile(blob, `书记_${formatDate(entry.date)}.md`);
      } else if (format === 'doc') {
        // 导出为doc（使用HTML内容保留格式，包含图片）
        let imageHtml = '';
        if (entry.image) {
          imageHtml = `<div style="margin: 1rem 0; text-align: center;"><img src="${entry.image}" alt="日记图片" style="max-width: 200px; max-height: 200px; width: auto; height: auto; border-radius: 8px; display: block; margin: 0 auto;" /></div>`;
        }
        
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>书记</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              p { margin: 0.5rem 0; }
            </style>
          </head>
          <body>
            <h1>${formatDate(entry.date)} ${formatTime(entry.createdAt)}</h1>
            <p>天气: ${entry.weather}</p>
            <p>心情: ${entry.mood}</p>
            <hr/>
            ${imageHtml}
            <div>${entry.content}</div>
          </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
        downloadFile(blob, `书记_${formatDate(entry.date)}.doc`);
      } else if (format === 'pdf') {
        // PDF导出：创建一个包含图片的HTML页面，然后使用浏览器打印功能
        let imageHtml = '';
        if (entry.image) {
          imageHtml = `<div style="margin: 1rem 0; text-align: center;"><img src="${entry.image}" alt="日记图片" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
        }
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset='utf-8'>
            <title>书记 - ${formatDate(entry.date)}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                @page { margin: 1cm; }
              }
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; border-bottom: 2px solid #1ea5f9; padding-bottom: 10px; }
              p { margin: 0.5rem 0; line-height: 1.6; }
              img { max-width: 100%; height: auto; display: block; margin: 1rem auto; }
              .content { line-height: 1.8; }
              hr { border: none; border-top: 1px solid #ddd; margin: 1rem 0; }
            </style>
          </head>
          <body>
            <h1>${formatDate(entry.date)} ${formatTime(entry.createdAt)}</h1>
            <p><strong>天气:</strong> ${entry.weather}</p>
            <p><strong>心情:</strong> ${entry.mood}</p>
            <hr/>
            ${imageHtml}
            <div class="content">${entry.content}</div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              };
            </script>
          </body>
          </html>
        `;
        
        // 创建新窗口并打印
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          toast.success('正在打开打印预览，请选择"另存为PDF"');
        } else {
          toast.error('无法打开打印窗口，请检查浏览器弹窗设置');
        }
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
  const handleExportAllClick = () => {
    if (onExportAll) {
      onExportAll();
    }
  };

  // 导入日记
  const handleImportAllClick = () => {
    if (onImportAll) {
      onImportAll();
    }
  };

  // 删除所有日记
  const handleDeleteAll = () => {
    if (diaryEntries.length === 0) {
      toast('没有书记可以删除', { icon: '⚠️' });
      return;
    }

    const confirmed = window.confirm(
      `确定要删除所有 ${diaryEntries.length} 篇书记吗？\n\n此操作无法撤销！建议先导出备份。`
    );

    if (confirmed && onDeleteAll) {
      onDeleteAll();
    }
  };

  // 从 HTML 中提取纯文本，保留换行
  const getTextFromHTML = (html: string): string => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // 将 <p> 标签转换为换行符，保留文本内容
    const paragraphs = div.querySelectorAll('p');
    if (paragraphs.length > 0) {
      return Array.from(paragraphs)
        .map(p => (p.textContent || '').trim())
        .join('\n');
    }
    // 如果没有 <p> 标签，直接返回文本内容
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="diary-list">
      <div className="diary-list__header">
        <h3 className="diary-list__title">📖 书记 ({diaryEntries.length})</h3>
        {onSearchContentChange && (
          <div className="diary-list__search">
            <FilterSearchInput
              value={searchContent}
              onChange={onSearchContentChange}
              placeholder="文本"
            />
          </div>
        )}
        <div className="diary-list__actions">
          <button 
            className="action-icon-btn"
            onClick={handleExportAllClick}
            title="导出所有书记为JSON"
          >
            📤
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleImportAllClick}
            title="从JSON导入书记"
          >
            📥
          </button>
          <button 
            className="action-icon-btn"
            onClick={handleDeleteAll}
            title="删除所有书记"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="diary-list__items">
        {diaryEntries.map(entry => (
          <div 
            key={entry.id} 
            className={`diary-item ${entry.id === currentDiaryId ? 'diary-item--active' : ''} ${exportMenuOpenId === entry.id ? 'diary-item--menu-open' : ''}`}
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
                      {entry.image ? (
                        // 如果有图片，只显示PDF导出
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleExport(entry, 'pdf');
                        }}>
                          📕 PDF
                        </button>
                      ) : (
                        // 如果没有图片，显示所有4种导出格式
                        <>
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
                        </>
                      )}
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
                fontFamily: entry.font || "'Courier New', 'STKaiti', 'KaiTi', serif",
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span className="diary-item__preview-text" style={{ flex: 1 }}>
                {getTextFromHTML(entry.content).substring(0, 100)}
                {getTextFromHTML(entry.content).length > 100 && '...'}
              </span>
              {entry.image && (
                <span className="diary-item__preview-image" style={{ marginLeft: '1rem', display: 'inline-block', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={entry.image} alt="预览图片" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </span>
              )}
            </div>
          </div>
        ))}
        {diaryEntries.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📖</div>
            <p>还没有书记哦</p>
            <p className="empty-state__hint">在中间写下你的第一篇书记吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryList;
