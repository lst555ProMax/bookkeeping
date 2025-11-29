import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { StudyRecord, StudyCategory } from '@/utils';
import { getStudyCategories } from '@/utils';
import { DatePicker, FormSelect, FormNumberInput, FormTextInput, FormTextarea } from '@/components/common';
import type { FormSelectOption } from '@/components/common';
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

  // 从 localStorage 恢复表单数据（页面切换时保持）
  const loadFormData = () => {
    const saved = localStorage.getItem('studyFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedFormData = loadFormData();
  // 表单状态
  const [date, setDate] = useState(savedFormData?.date || getDefaultDate());
  const [category, setCategory] = useState(savedFormData?.category || getStudyCategories()[0]);
  const [videoTitle, setVideoTitle] = useState(savedFormData?.videoTitle || '');
  const [episodeStart, setEpisodeStart] = useState(savedFormData?.episodeStart || '');
  const [episodeEnd, setEpisodeEnd] = useState(savedFormData?.episodeEnd || '');
  const [totalTime, setTotalTime] = useState(savedFormData?.totalTime || '');
  const [remark, setRemark] = useState(savedFormData?.remark || '');
  const [categories, setCategories] = useState<StudyCategory[]>([]);

  // 将分类数组转换为 FormSelectOption 数组
  const categoryOptions: FormSelectOption[] = categories.map(cat => ({
    value: cat,
    label: cat
  }));

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

  // 初始化 sessionStorage 标记（如果不存在）
  useEffect(() => {
    if (!sessionStorage.getItem('studyFormInitialized')) {
      sessionStorage.setItem('studyFormInitialized', 'true');
      // 首次加载时清除 localStorage 中的表单数据
      localStorage.removeItem('studyFormData');
    }
  }, []);

  useEffect(() => {
    // 监听页面卸载，清除标记（刷新时会重新设置）
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('studyFormInitialized');
      // 刷新时清除表单数据
      localStorage.removeItem('studyFormData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 保存表单数据到 localStorage（页面切换时保持）
  useEffect(() => {
    if (!editingRecord) {
      localStorage.setItem('studyFormData', JSON.stringify({
        date,
        category,
        videoTitle,
        episodeStart,
        episodeEnd,
        totalTime,
        remark
      }));
    }
  }, [date, category, videoTitle, episodeStart, episodeEnd, totalTime, remark, editingRecord]);

  // 使用 ref 跟踪之前的编辑状态
  const prevEditingRecordRef = React.useRef<StudyRecord | null>(null);

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
      // 如果之前有编辑状态，现在变为 null（取消编辑或删除），则重置表单
      if (prevEditingRecordRef.current !== null) {
        resetForm();
      } else {
        // 只在页面刷新时重置表单，页面切换时不重置（数据已从 localStorage 恢复）
        const isFirstLoad = !sessionStorage.getItem('studyFormInitialized');
        if (isFirstLoad && !savedFormData) {
          resetForm();
        }
      }
    }
    // 更新 ref
    prevEditingRecordRef.current = editingRecord;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!date) {
      toast.error('请选择日期');
      return;
    }

    if (!videoTitle.trim()) {
      toast.error('请输入视频标题');
      return;
    }

    if (!episodeStart || !episodeEnd) {
      toast.error('请输入观看集数');
      return;
    }

    const startEp = parseInt(episodeStart);
    const endEp = parseInt(episodeEnd);

    if (isNaN(startEp) || isNaN(endEp)) {
      toast.error('集数必须是有效的数字');
      return;
    }

    if (startEp < 1 || endEp < 1) {
      toast.error('集数不能小于1');
      return;
    }

    if (startEp > endEp) {
      toast.error('结束集数必须大于或等于起始集数');
      return;
    }

    // 验证观看集数范围：1-1000
    if (startEp > 1000 || endEp > 1000) {
      toast.error('观看集数不能超过1000');
      return;
    }

    if (!totalTime) {
      toast.error('请输入观看总时间');
      return;
    }

    const time = parseInt(totalTime);
    if (isNaN(time) || time <= 0) {
      toast.error('观看总时间必须是大于0的数字');
      return;
    }

    // 验证观看总时间范围：1-1440
    if (time > 1440) {
      toast.error('观看总时间不能超过1440分钟（24小时）');
      return;
    }

    // 验证视频标题长度不能超过30个字
    if (videoTitle.trim().length > 30) {
      toast.error('视频标题长度不能超过30个字');
      return;
    }

    // 验证备注长度不能超过50个字
    if (remark.trim().length > 50) {
      toast.error('备注长度不能超过50个字');
      return;
    }

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      toast.error('日期必须从2024年10月开始');
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

    if (editingRecord) {
      onUpdateRecord(studyRecord);
    } else {
      onAddRecord(studyRecord);
    }
    resetForm();

  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  // 快捷键处理：Ctrl + Enter 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const form = document.querySelector('.study-form__form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="study-form">
      <div className="study-form__header">
        <h2>{editingRecord ? '✏️ 编辑学习记录' : '📚 添加学习记录'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="study-form__form">
        {/* 日期 */}
        <div className="form-group">
          <label htmlFor="date">
            📅 日期 <span className="required">*</span>
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            minDate="2025-10-01"
          />
        </div>

        {/* 分类 */}
        <div className="form-group">
          <label htmlFor="category">
            🏷️ 分类 <span className="required">*</span>
          </label>
          <div className="category-select-wrapper">
            <FormSelect
              id="category"
              value={category}
              onChange={(value) => setCategory(value as StudyCategory)}
              options={categoryOptions}
              placeholder="请选择分类"
              required
            />
            <div 
            className="category-btn-wrapper"
            onClick={onOpenCategoryManager}
            >
              <button
                type="button"
                className="category-btn"
                title="管理学习分类"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* 视频标题 */}
        <div className="form-group">
          <label htmlFor="videoTitle">
            🎬 视频标题 <span className="required">*</span>
            <span className="quality-hint">（最多30字）</span>
          </label>
          <FormTextInput
            id="videoTitle"
            value={videoTitle}
            onChange={setVideoTitle}
            placeholder="例如：React 入门教程"
            required
            maxLength={30}
          />
        </div>

        {/* 观看集数和观看总时间 - 一行显示 */}
        <div className="form-group">
          <div className="episode-time-row">
            <div className="episode-section">
              <label>
                📺 观看集数 <span className="required">*</span>
              </label>
              <div className="episode-inputs">
                <FormNumberInput
                  value={episodeStart}
                  onChange={setEpisodeStart}
                  placeholder="1"
                  min={1}
                  max={1000}
                  step={1}
                  required
                />
                <span className="episode-separator">至</span>
                <FormNumberInput
                  value={episodeEnd}
                  onChange={setEpisodeEnd}
                  placeholder="20"
                  min={1}
                  max={1000}
                  step={1}
                  required
                />
                <span className="episode-unit">集</span>
              </div>
            </div>
            <div className="time-section">
              <label>
                ⏱️ 观看总时间 <span className="required">*</span>
              </label>
              <div className="time-input-wrapper">
                <FormNumberInput
                  id="totalTime"
                  value={totalTime}
                  onChange={setTotalTime}
                  placeholder="120"
                  min={1}
                  max={1440}
                  step={1}
                  required
                />
                <span className="time-unit">分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="form-group">
          <label htmlFor="remark">
            📝 备注
            <span className="quality-hint">（最多50字）</span>
          </label>
          <FormTextarea
            id="remark"
            value={remark}
            onChange={setRemark}
            placeholder="记录学习心得、难点等..."
            maxLength={50}
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
