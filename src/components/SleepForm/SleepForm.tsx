import React, { useState, useEffect } from 'react';
import { SleepRecord } from '@/types';
import { calculateSleepDuration } from '@/utils/sleepStorage';
import './SleepForm.scss';

interface SleepFormProps {
  onAddSleep: (record: SleepRecord) => void;
  onUpdateSleep: (record: SleepRecord) => void;
  onCancelEdit: () => void;
  editingSleep: SleepRecord | null;
}

const SleepForm: React.FC<SleepFormProps> = ({
  onAddSleep,
  onUpdateSleep,
  onCancelEdit,
  editingSleep
}) => {
  // 获取默认日期（今天）
  const getDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getDefaultDate());
  const [sleepTime, setSleepTime] = useState('00:00');
  const [wakeTime, setWakeTime] = useState('08:00');
  const [quality, setQuality] = useState<string>('80');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(getDefaultDate());
    setSleepTime('00:00');
    setWakeTime('08:00');
    setQuality('80');
    setNotes('');
  };

  // 当编辑记录时，填充表单
  useEffect(() => {
    if (editingSleep) {
      setDate(editingSleep.date);
      setSleepTime(editingSleep.sleepTime);
      setWakeTime(editingSleep.wakeTime);
      setQuality(String(editingSleep.quality));
      setNotes(editingSleep.notes || '');
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSleep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!date || !sleepTime || !wakeTime) {
      alert('请填写所有必填字段');
      return;
    }

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      alert('日期必须从2024年10月开始');
      return;
    }

    // 验证质量分数范围
    const qualityNum = Number(quality);
    if (!quality || isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      alert('睡眠质量分数必须在0-100之间');
      return;
    }

    // 计算睡眠时长
    const duration = calculateSleepDuration(sleepTime, wakeTime);

    const sleepRecord: SleepRecord = {
      id: editingSleep?.id || `sleep_${Date.now()}`,
      date,
      sleepTime,
      wakeTime,
      quality: qualityNum,
      duration,
      notes: notes.trim() || undefined,
      createdAt: editingSleep?.createdAt || new Date()
    };
    if(window.confirm('确定添加这条睡眠记录吗？')){
        if (editingSleep) {
        onUpdateSleep(sleepRecord);
        } else {
        onAddSleep(sleepRecord);
        }
    }

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <div className="sleep-form">
      <div className="sleep-form__header">
        <h2>{editingSleep ? '✏️ 编辑睡眠记录' : '🌙 添加睡眠记录'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="sleep-form__form">
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sleepTime">
              入睡时间 <span className="required">*</span>
            </label>
            <input
              type="time"
              id="sleepTime"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="wakeTime">
              醒来时间 <span className="required">*</span>
            </label>
            <input
              type="time"
              id="wakeTime"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="quality">
            睡眠质量 <span className="required">*</span>
            <span className="quality-hint">（手环分数：0-100）</span>
          </label>
          <input
            type="number"
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            min="0"
            max="100"
            placeholder="输入手环监测的睡眠质量分数"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">备注</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录今天的睡眠情况..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          {editingSleep && (
            <button type="button" onClick={handleCancel} className="btn btn--cancel">
              取消
            </button>
          )}
          <button type="submit" className="btn btn--submit">
            {editingSleep ? '更新记录' : '添加记录'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SleepForm;
