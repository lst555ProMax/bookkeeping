import React, { useState, useEffect } from 'react';
import { StudyRecord, StudyCategory } from '@/types';
import { getStudyCategories } from '@/utils';
import './StudyRecordForm.scss';

interface StudyRecordFormProps {
  onAddRecord: (record: StudyRecord) => void;
  onUpdateRecord: (record: StudyRecord) => void;
  onCancelEdit: () => void;
  onOpenCategoryManager: () => void;
  editingRecord: StudyRecord | null;
  categoriesKey?: number; // 用于强制重新渲染
}

const StudyRecordForm: React.FC<StudyRecordFormProps> = ({
  onAddRecord,
  onUpdateRecord,
  onCancelEdit,
  onOpenCategoryManager,
  editingRecord,
  categoriesKey
}) => {
  // 获取默认日期（今天）
  const getDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 表单状态
  const [date, setDate] = useState(getDefaultDate());
  const [category, setCategory] = useState(getStudyCategories()[0]);
  const [videoTitle, setVideoTitle] = useState('');
  const [episodeStart, setEpisodeStart] = useState('');
  const [episodeEnd, setEpisodeEnd] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [remark, setRemark] = useState('');
  const [categories, setCategories] = useState<StudyCategory[]>([]);

  const resetForm = () => {
    setDate(getDefaultDate());
    setCategory(getStudyCategories()[0]);
    setVideoTitle('');
    setEpisodeStart('');
    setEpisodeEnd('');
    setTotalTime('');
    setRemark('');
  };

  // 加载分类列表
  useEffect(() => {
    const loadedCategories = getStudyCategories();
    setCategories(loadedCategories);
    
    // 如果当前分类不在列表中，重置为第一个分类
    if (loadedCategories.length > 0 && !loadedCategories.includes(category)) {
      setCategory(loadedCategories[0]);
    }
  }, [categoriesKey, category]);

  // 当编辑记录时，填充表单
  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setCategory(editingRecord.category);
      setVideoTitle(editingRecord.videoTitle);
      setEpisodeStart(editingRecord.episodeStart.toString());
      setEpisodeEnd(editingRecord.episodeEnd.toString());
      setTotalTime(editingRecord.totalTime.toString());
      setRemark(editingRecord.remark || '');
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!date) {
      alert('请选择日期');
      return;
    }

    if (!videoTitle.trim()) {
      alert('请输入视频标题');
      return;
    }

    if (!episodeStart || !episodeEnd) {
      alert('请输入观看集数');
      return;
    }

    const startEp = parseInt(episodeStart);
    const endEp = parseInt(episodeEnd);

    if (isNaN(startEp) || isNaN(endEp)) {
      alert('集数必须是有效的数字');
      return;
    }

    if (startEp < 0 || endEp < 0) {
      alert('集数不能为负数');
      return;
    }

    if (startEp > endEp) {
      alert('结束集数必须大于或等于起始集数');
      return;
    }

    if (!totalTime) {
      alert('请输入观看总时间');
      return;
    }

    const time = parseInt(totalTime);
    if (isNaN(time) || time <= 0) {
      alert('观看总时间必须是大于0的数字');
      return;
    }

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      alert('日期必须从2024年10月开始');
      return;
    }

    const now = new Date().toISOString();
    const studyRecord: StudyRecord = {
      id: editingRecord?.id || `study_${Date.now()}`,
      date,
      category,
      videoTitle: videoTitle.trim(),
      episodeStart: startEp,
      episodeEnd: endEp,
      totalTime: time,
      remark: remark.trim() || undefined,
      createdAt: editingRecord?.createdAt || now,
      updatedAt: now
    };

    if (window.confirm(editingRecord ? '确定更新这条学习记录吗？' : '确定添加这条学习记录吗？')) {
      if (editingRecord) {
        onUpdateRecord(studyRecord);
      } else {
        onAddRecord(studyRecord);
      }
      resetForm();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <div className="study-form">
      <div className="study-form__header">
        <h2>{editingRecord ? '✏️ 编辑学习记录' : '📚 添加学习记录'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="study-form__form">
        {/* 日期 */}
        <div className="form-group">
          <label htmlFor="date">
            日期 <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min="2024-10-01"
            required
          />
        </div>

        {/* 分类 */}
        <div className="form-group">
          <label htmlFor="category">
            分类 <span className="required">*</span>
          </label>
          <div className="category-select-wrapper">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as StudyCategory)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="category-btn"
              onClick={onOpenCategoryManager}
              title="管理学习分类"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* 视频标题 */}
        <div className="form-group">
          <label htmlFor="videoTitle">
            视频标题 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="videoTitle"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="例如：React 入门教程"
            required
          />
        </div>

        {/* 观看集数和观看总时间 - 一行显示 */}
        <div className="form-group">
          <div className="episode-time-row">
            <div className="episode-section">
              <label>
                观看集数 <span className="required">*</span>
              </label>
              <div className="episode-inputs">
                <input
                  type="number"
                  value={episodeStart}
                  onChange={(e) => setEpisodeStart(e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="episode-separator">至</span>
                <input
                  type="number"
                  value={episodeEnd}
                  onChange={(e) => setEpisodeEnd(e.target.value)}
                  placeholder="20"
                  min="0"
                  required
                />
                <span className="episode-unit">集</span>
              </div>
            </div>
            <div className="time-section">
              <label>
                观看总时间 <span className="required">*</span>
              </label>
              <div className="time-input-wrapper">
                <input
                  type="number"
                  id="totalTime"
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  placeholder="120"
                  min="1"
                  required
                />
                <span className="time-unit">分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="form-group">
          <label htmlFor="remark">备注</label>
          <textarea
            id="remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="记录学习心得、难点等..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          {editingRecord && (
            <button type="button" onClick={handleCancel} className="btn btn--cancel">
              取消
            </button>
          )}
          <button type="submit" className="btn btn--submit">
            {editingRecord ? '更新记录' : '添加记录'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyRecordForm;
