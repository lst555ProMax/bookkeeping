import React, { useState, useRef, useEffect } from 'react';
import './DiaryRecords.scss';

interface QuickNote {
  id: string;
  content: string;
  timestamp: string;
}

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
}

const DiaryRecords: React.FC = () => {
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载数据
  useEffect(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    const savedEntries = localStorage.getItem('diaryEntries');
    if (savedNotes) setQuickNotes(JSON.parse(savedNotes));
    if (savedEntries) setDiaryEntries(JSON.parse(savedEntries));
  }, []);

  // 添加速记
  const handleAddQuickNote = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && quickNoteInput.trim()) {
      const newNote: QuickNote = {
        id: Date.now().toString(),
        content: quickNoteInput.trim(),
        timestamp: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      const updatedNotes = [newNote, ...quickNotes];
      setQuickNotes(updatedNotes);
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      setQuickNoteInput('');
    }
  };

  // 删除速记
  const handleDeleteQuickNote = (id: string) => {
    const updatedNotes = quickNotes.filter(note => note.id !== id);
    setQuickNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
  };

  // 保存日记
  const handleSaveDiary = () => {
    if (!diaryContent.trim()) {
      alert('请输入日记内容');
      return;
    }

    const existingIndex = diaryEntries.findIndex(entry => entry.date === selectedDate);
    let updatedEntries;

    if (existingIndex >= 0) {
      // 更新现有日记
      updatedEntries = [...diaryEntries];
      updatedEntries[existingIndex] = {
        ...updatedEntries[existingIndex],
        content: diaryContent
      };
    } else {
      // 创建新日记
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        content: diaryContent
      };
      updatedEntries = [newEntry, ...diaryEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    alert('日记保存成功！');
  };

  // 加载日记
  const handleLoadDiary = (entry: DiaryEntry) => {
    setSelectedDate(entry.date);
    setDiaryContent(entry.content);
  };

  // 删除日记
  const handleDeleteDiary = (id: string) => {
    if (!window.confirm('确定要删除这篇日记吗？')) return;
    
    const updatedEntries = diaryEntries.filter(entry => entry.id !== id);
    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    
    // 如果删除的是当前选中的日记，清空内容
    const deletedEntry = diaryEntries.find(entry => entry.id === id);
    if (deletedEntry?.date === selectedDate) {
      setDiaryContent('');
    }
  };

  // 新建日记
  const handleNewDiary = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDiaryContent('');
  };

  return (
    <div className="diary-records">
      {/* 左侧：速记区 */}
      <div className="diary-records__quick-notes">
        <div className="quick-notes__header">
          <h3>💭 速记</h3>
        </div>
        <div className="quick-notes__input">
          <textarea
            placeholder="记录你的灵感（按Ctrl+Enter保存）"
            value={quickNoteInput}
            onChange={(e) => setQuickNoteInput(e.target.value)}
            onKeyDown={handleAddQuickNote}
          />
        </div>
        <div className="quick-notes__list">
          {quickNotes.map(note => (
            <div key={note.id} className="quick-note-item">
              <div className="quick-note-item__content">{note.content}</div>
              <div className="quick-note-item__footer">
                <span className="timestamp">{note.timestamp}</span>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteQuickNote(note.id)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：日记本 */}
      <div className="diary-records__notebook">
        <div className="notebook__spine"></div>
        <div className="notebook__page">
          <div className="notebook__header">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            <div className="notebook__actions">
              <button className="action-btn" onClick={handleNewDiary} title="新建">
                📄
              </button>
              <button className="action-btn save-btn" onClick={handleSaveDiary} title="保存">
                �
              </button>
            </div>
          </div>
          
          <div className="notebook__content">
            <textarea
              ref={textareaRef}
              placeholder="记录你的灵感（按Ctrl+Enter保存）"
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              className="diary-textarea"
            />
          </div>

          <div className="notebook__lines">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="line"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧：日记列表 */}
      <div className="diary-records__list">
        <div className="diary-list__header">
          <h3>📚 日记列表</h3>
          <span className="diary-count">{diaryEntries.length} 篇</span>
        </div>
        <div className="diary-list__items">
          {diaryEntries.map(entry => (
            <div 
              key={entry.id} 
              className={`diary-item ${entry.date === selectedDate ? 'diary-item--active' : ''}`}
              onClick={() => handleLoadDiary(entry)}
            >
              <div className="diary-item__header">
                <span className="diary-item__date">
                  📅 {new Date(entry.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button 
                  className="diary-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDiary(entry.id);
                  }}
                  title="删除"
                >
                  ✕
                </button>
              </div>
              <div className="diary-item__preview">
                {entry.content.substring(0, 100)}
                {entry.content.length > 100 && '...'}
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
    </div>
  );
};

export default DiaryRecords;
