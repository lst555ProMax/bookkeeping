import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SleepRecord, loadSleepRecords } from '@/utils';
import { calculateSleepDuration } from '@/utils';
import { DatePicker, TimePicker, FormNumberInput, FormTextarea } from '@/components/common';
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

  // 从 localStorage 恢复表单数据（页面切换时保持）
  const loadFormData = () => {
    const saved = localStorage.getItem('sleepFormData');
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
  const [date, setDate] = useState(savedFormData?.date || getDefaultDate());
  const [sleepTime, setSleepTime] = useState(savedFormData?.sleepTime || '00:00');
  const [wakeTime, setWakeTime] = useState(savedFormData?.wakeTime || '08:00');
  const [quality, setQuality] = useState<string>(savedFormData?.quality || '');
  const [notes, setNotes] = useState(savedFormData?.notes || '');
  const [naps, setNaps] = useState(savedFormData?.naps || {
    morning: false,
    noon: false,
    afternoon: false,
    evening: false
  });

  const resetForm = () => {
    setDate(getDefaultDate());
    setSleepTime('00:00');
    setWakeTime('08:00');
    setQuality('');
    setNotes('');
    setNaps({
      morning: false,
      noon: false,
      afternoon: false,
      evening: false
    });
  };

  // 检查是否是页面刷新（首次加载）
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    const initialized = sessionStorage.getItem('sleepFormInitialized');
    if (!initialized) {
      sessionStorage.setItem('sleepFormInitialized', 'true');
      // 首次加载时清除 localStorage 中的表单数据
      localStorage.removeItem('sleepFormData');
      return true;
    }
    return false;
  });

  useEffect(() => {
    // 监听页面卸载，清除标记（刷新时会重新设置）
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('sleepFormInitialized');
      // 刷新时清除表单数据
      localStorage.removeItem('sleepFormData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 保存表单数据到 localStorage（页面切换时保持）
  useEffect(() => {
    if (!editingSleep) {
      localStorage.setItem('sleepFormData', JSON.stringify({
        date,
        sleepTime,
        wakeTime,
        quality,
        notes,
        naps
      }));
    }
  }, [date, sleepTime, wakeTime, quality, notes, naps, editingSleep]);

  // 使用 ref 跟踪之前的编辑状态
  const prevEditingSleepRef = React.useRef<SleepRecord | null>(null);

  // 当编辑记录时，填充表单
  useEffect(() => {
    if (editingSleep) {
      setDate(editingSleep.date);
      setSleepTime(editingSleep.sleepTime);
      setWakeTime(editingSleep.wakeTime);
      setQuality(String(editingSleep.quality));
      setNotes(editingSleep.notes || '');
      setNaps({
        morning: editingSleep.naps?.morning || false,
        noon: editingSleep.naps?.noon || false,
        afternoon: editingSleep.naps?.afternoon || false,
        evening: editingSleep.naps?.evening || false
      });
    } else {
      // 如果之前有编辑状态，现在变为 null（取消编辑或删除），则重置表单
      if (prevEditingSleepRef.current !== null) {
        resetForm();
      } else if (isFirstLoad && !savedFormData) {
        // 只在页面刷新时重置表单，页面切换时不重置（数据已从 localStorage 恢复）
        resetForm();
        setIsFirstLoad(false); // 标记已处理首次加载
      }
    }
    // 更新 ref
    prevEditingSleepRef.current = editingSleep;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSleep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!date || !sleepTime || !wakeTime) {
      toast.error('请填写所有必填字段');
      return;
    }

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      toast.error('日期必须从2024年10月开始');
      return;
    }

    // 验证质量分数范围
    const qualityNum = Number(quality);
    if (!quality || isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      toast.error('睡眠质量分数必须在0-100之间');
      return;
    }

    // 验证备注长度不能超过50个字
    if (notes.trim().length > 50) {
      toast.error('备注长度不能超过50个字');
      return;
    }

    // 验证日期不能大于今天
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (recordDate > today) {
      toast.error('日期不能大于今天');
      return;
    }

    // 验证同一日期只能有一条记录（编辑时排除当前记录）
    if (!editingSleep) {
      const existingRecords = loadSleepRecords();
      const hasSameDate = existingRecords.some(record => record.date === date);
      if (hasSameDate) {
        toast.error('该日期已存在睡眠记录，同一日期只能有一条记录');
        return;
      }
    } else {
      // 编辑时，检查是否有其他记录使用相同日期
      const existingRecords = loadSleepRecords();
      const hasSameDate = existingRecords.some(record => record.date === date && record.id !== editingSleep.id);
      if (hasSameDate) {
        toast.error('该日期已存在其他睡眠记录，同一日期只能有一条记录');
        return;
      }
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
      naps: {
        morning: naps.morning,
        noon: naps.noon,
        afternoon: naps.afternoon,
        evening: naps.evening
      },
      notes: notes.trim() || undefined,
      createdAt: editingSleep?.createdAt || new Date()
    };
    if (editingSleep) {
    onUpdateSleep(sleepRecord);
    } else {
    onAddSleep(sleepRecord);
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
        const form = document.querySelector('.sleep-form__form') as HTMLFormElement;
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
    <div className="sleep-form">
      <div className="sleep-form__header">
        <h2>{editingSleep ? '✏️ 编辑睡眠记录' : '🌙 添加睡眠记录'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="sleep-form__form">
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sleepTime">
              🌙 入睡时间 <span className="required">*</span>
            </label>
            <TimePicker
              value={sleepTime}
              onChange={setSleepTime}
              placeholder="请选择入睡时间"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wakeTime">
              ☀️ 醒来时间 <span className="required">*</span>
            </label>
            <TimePicker
              value={wakeTime}
              onChange={setWakeTime}
              placeholder="请选择醒来时间"
            />
          </div>
        </div>

        <div className="form-group">
          <label>💤 小睡</label>
          <div className="nap-checkboxes">
            <div className="nap-row">
              <div className="checkbox-item">
                <span>🌅 上午</span>
                <input
                  type="checkbox"
                  checked={naps.morning}
                  onChange={(e) => setNaps({ ...naps, morning: e.target.checked })}
                />
              </div>
              <div className="checkbox-item">
                <span>☀️ 中午</span>
                <input
                  type="checkbox"
                  checked={naps.noon}
                  onChange={(e) => setNaps({ ...naps, noon: e.target.checked })}
                />
              </div>
              <div className="checkbox-item">
                <span>🌤️ 下午</span>
                <input
                  type="checkbox"
                  checked={naps.afternoon}
                  onChange={(e) => setNaps({ ...naps, afternoon: e.target.checked })}
                />
              </div>
              <div className="checkbox-item">
                <span>🌙 晚上</span>
                <input
                  type="checkbox"
                  checked={naps.evening}
                  onChange={(e) => setNaps({ ...naps, evening: e.target.checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="quality">
            ⭐ 睡眠质量 <span className="required">*</span>
            <span className="quality-hint">（手环分数：0-100）</span>
          </label>
          <FormNumberInput
            id="quality"
            value={quality}
            onChange={setQuality}
            min={0}
            max={100}
            step={1}
            placeholder="80"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">
            📝 备注
            <span className="quality-hint">（最多50字）</span>
          </label>
          <FormTextarea
            id="notes"
            value={notes}
            onChange={setNotes}
            placeholder="记录今天的睡眠情况..."
            maxLength={50}
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
