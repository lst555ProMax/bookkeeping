import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DailyRecord, MealStatus, loadDailyRecords } from '@/utils';
import { DatePicker, TimePicker, FormNumberInput, FormTextarea } from '@/components/common';
import './DailyRecordForm.scss';

interface DailyRecordFormProps {
  onAddRecord: (record: DailyRecord) => void;
  onUpdateRecord: (record: DailyRecord) => void;
  onCancelEdit: () => void;
  editingRecord: DailyRecord | null;
}

const DailyRecordForm: React.FC<DailyRecordFormProps> = ({
  onAddRecord,
  onUpdateRecord,
  onCancelEdit,
  editingRecord
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
    const saved = localStorage.getItem('dailyFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const savedFormData = loadFormData();
  // 表单状态
  const [date, setDate] = useState(savedFormData?.date || getDefaultDate());
  
  // 三餐状态（默认都是规律）
  const [breakfast, setBreakfast] = useState<MealStatus>(savedFormData?.breakfast || MealStatus.EATEN_REGULAR);
  const [lunch, setLunch] = useState<MealStatus>(savedFormData?.lunch || MealStatus.EATEN_REGULAR);
  const [dinner, setDinner] = useState<MealStatus>(savedFormData?.dinner || MealStatus.EATEN_REGULAR);
  
  // 洗漱状态
  const [morningWash, setMorningWash] = useState(savedFormData?.morningWash || false);
  const [nightWash, setNightWash] = useState(savedFormData?.nightWash || false);
  
  // 洗浴状态
  const [shower, setShower] = useState(savedFormData?.shower || false);
  const [hairWash, setHairWash] = useState(savedFormData?.hairWash || false);
  const [footWash, setFootWash] = useState(savedFormData?.footWash || false);
  const [faceWash, setFaceWash] = useState(savedFormData?.faceWash || false);
  
  // 其他状态
  const [laundry, setLaundry] = useState(savedFormData?.laundry || false);
  const [cleaning, setCleaning] = useState(savedFormData?.cleaning || false);
  const [wechatSteps, setWechatSteps] = useState(savedFormData?.wechatSteps || '');
  
  // 打卡时间
  const [checkInTime, setCheckInTime] = useState(savedFormData?.checkInTime || '');
  const [checkOutTime, setCheckOutTime] = useState(savedFormData?.checkOutTime || '');
  const [leaveTime, setLeaveTime] = useState(savedFormData?.leaveTime || '');
  
  // 备注
  const [notes, setNotes] = useState(savedFormData?.notes || '');

  const resetForm = () => {
    setDate(getDefaultDate());
    setBreakfast(MealStatus.EATEN_REGULAR);
    setLunch(MealStatus.EATEN_REGULAR);
    setDinner(MealStatus.EATEN_REGULAR);
    setMorningWash(false);
    setNightWash(false);
    setShower(false);
    setHairWash(false);
    setFootWash(false);
    setFaceWash(false);
    setLaundry(false);
    setCleaning(false);
    setWechatSteps('');
    setCheckInTime('');
    setCheckOutTime('');
    setLeaveTime('');
    setNotes('');
  };

  // 检查是否是页面刷新（首次加载）
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    const initialized = sessionStorage.getItem('dailyFormInitialized');
    if (!initialized) {
      sessionStorage.setItem('dailyFormInitialized', 'true');
      // 首次加载时清除 localStorage 中的表单数据
      localStorage.removeItem('dailyFormData');
      return true;
    }
    return false;
  });

  useEffect(() => {
    // 监听页面卸载，清除标记（刷新时会重新设置）
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('dailyFormInitialized');
      // 刷新时清除表单数据
      localStorage.removeItem('dailyFormData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 保存表单数据到 localStorage（页面切换时保持）
  useEffect(() => {
    if (!editingRecord) {
      localStorage.setItem('dailyFormData', JSON.stringify({
        date,
        breakfast,
        lunch,
        dinner,
        morningWash,
        nightWash,
        shower,
        hairWash,
        footWash,
        faceWash,
        laundry,
        cleaning,
        wechatSteps,
        checkInTime,
        checkOutTime,
        leaveTime,
        notes
      }));
    }
  }, [date, breakfast, lunch, dinner, morningWash, nightWash, shower, hairWash, footWash, faceWash, laundry, cleaning, wechatSteps, checkInTime, checkOutTime, leaveTime, notes, editingRecord]);

  // 使用 ref 跟踪之前的编辑状态
  const prevEditingRecordRef = React.useRef<DailyRecord | null>(null);

  // 当编辑记录时，填充表单
  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setBreakfast(editingRecord.meals.breakfast);
      setLunch(editingRecord.meals.lunch);
      setDinner(editingRecord.meals.dinner);
      setMorningWash(editingRecord.hygiene.morningWash);
      setNightWash(editingRecord.hygiene.nightWash);
      setShower(editingRecord.bathing.shower);
      setHairWash(editingRecord.bathing.hairWash);
      setFootWash(editingRecord.bathing.footWash);
      setFaceWash(editingRecord.bathing.faceWash);
      setLaundry(editingRecord.laundry);
      setCleaning(editingRecord.cleaning);
      setWechatSteps(editingRecord.wechatSteps?.toString() || '');
      setCheckInTime(editingRecord.checkInTime || '');
      setCheckOutTime(editingRecord.checkOutTime || '');
      setLeaveTime(editingRecord.leaveTime || '');
      setNotes(editingRecord.notes || '');
    } else {
      // 如果之前有编辑状态，现在变为 null（取消编辑或删除），则重置表单
      if (prevEditingRecordRef.current !== null) {
        resetForm();
      } else if (isFirstLoad && !savedFormData) {
        // 只在页面刷新时重置表单，页面切换时不重置（数据已从 localStorage 恢复）
        resetForm();
        setIsFirstLoad(false); // 标记已处理首次加载
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

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      toast.error('日期必须从2024年10月开始');
      return;
    }

    // 验证微信步数范围：0-100000
    if (wechatSteps) {
      const stepsNum = parseInt(wechatSteps);
      if (!isNaN(stepsNum) && (stepsNum < 0 || stepsNum > 100000)) {
        toast.error('微信步数必须在0-100000之间');
        return;
      }
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
    if (!editingRecord) {
      const existingRecords = loadDailyRecords();
      const hasSameDate = existingRecords.some(record => record.date === date);
      if (hasSameDate) {
        toast.error('该日期已存在日常记录，同一日期只能有一条记录');
        return;
      }
    } else {
      // 编辑时，检查是否有其他记录使用相同日期
      const existingRecords = loadDailyRecords();
      const hasSameDate = existingRecords.some(record => record.date === date && record.id !== editingRecord.id);
      if (hasSameDate) {
        toast.error('该日期已存在其他日常记录，同一日期只能有一条记录');
        return;
      }
    }

    const dailyRecord: DailyRecord = {
      id: editingRecord?.id || `daily_${Date.now()}`,
      date,
      meals: {
        breakfast,
        lunch,
        dinner
      },
      hygiene: {
        morningWash,
        nightWash
      },
      bathing: {
        shower,
        hairWash,
        footWash,
        faceWash
      },
      laundry,
      cleaning,
      wechatSteps: wechatSteps ? parseInt(wechatSteps) : undefined,
      checkInTime: checkInTime.trim() || undefined,
      checkOutTime: checkOutTime.trim() || undefined,
      leaveTime: leaveTime.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingRecord?.createdAt || new Date()
    };

    if (editingRecord) {
      onUpdateRecord(dailyRecord);
    } else {
      onAddRecord(dailyRecord);
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
        const form = document.querySelector('.daily-form__form') as HTMLFormElement;
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

  // 三餐状态循环切换函数
  const cycleMealStatus = (currentStatus: MealStatus): MealStatus => {
    switch (currentStatus) {
      case MealStatus.NOT_EATEN:
        return MealStatus.EATEN_IRREGULAR;
      case MealStatus.EATEN_IRREGULAR:
        return MealStatus.EATEN_REGULAR;
      case MealStatus.EATEN_REGULAR:
        return MealStatus.NOT_EATEN;
      default:
        return MealStatus.NOT_EATEN;
    }
  };

  // 获取三餐状态显示文本和样式
  const getMealStatusDisplay = (status: MealStatus) => {
    switch (status) {
      case MealStatus.NOT_EATEN:
        return { text: '❌ 未吃', class: 'not-eaten' };
      case MealStatus.EATEN_IRREGULAR:
        return { text: '⚠️ 不规律', class: 'irregular' };
      case MealStatus.EATEN_REGULAR:
        return { text: '✅ 规律', class: 'regular' };
      default:
        return { text: '❌ 未吃', class: 'not-eaten' };
    }
  };

  return (
    <div className="daily-form">
      <div className="daily-form__header">
        <h2>{editingRecord ? '✏️ 编辑日常记录' : '📝 添加日常记录'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="daily-form__form">
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

        {/* 打卡签到和打卡签退 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="checkInTime">
              💼 打卡签到
            </label>
            <TimePicker
              value={checkInTime}
              onChange={setCheckInTime}
              placeholder="请选择"
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkOutTime">
              💼 打卡签退
            </label>
            <TimePicker
              value={checkOutTime}
              onChange={setCheckOutTime}
              placeholder="请选择"
            />
          </div>
        </div>

        {/* 打卡离开和微信步数 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="leaveTime">
              💼 打卡离开
            </label>
            <TimePicker
              value={leaveTime}
              onChange={setLeaveTime}
              placeholder="请选择"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wechatSteps">
              👣 微信步数 <span className="required">*</span>
            </label>
            <FormNumberInput
              id="wechatSteps"
              value={wechatSteps}
              onChange={setWechatSteps}
              placeholder="8000"
              min={0}
              max={100000}
              step={1}
              arrowStep={500}
              wheelStep={500}
              required
            />
          </div>
        </div>

        {/* 三餐 */}
        <div className="form-group">
          <label>🍽️ 三餐 <span className="required">*</span></label>
          <div className="meal-checkboxes">
            <div className="meal-item">
              <span className="meal-name">早餐</span>
              <button
                type="button"
                className={`meal-checkbox meal-checkbox--${getMealStatusDisplay(breakfast).class}`}
                onClick={() => setBreakfast(cycleMealStatus(breakfast))}
                title={getMealStatusDisplay(breakfast).text}
              >
                {breakfast === MealStatus.NOT_EATEN && '❌'}
                {breakfast === MealStatus.EATEN_IRREGULAR && '⚠️'}
                {breakfast === MealStatus.EATEN_REGULAR && '✅'}
              </button>
            </div>
            <div className="meal-item">
              <span className="meal-name">午餐</span>
              <button
                type="button"
                className={`meal-checkbox meal-checkbox--${getMealStatusDisplay(lunch).class}`}
                onClick={() => setLunch(cycleMealStatus(lunch))}
                title={getMealStatusDisplay(lunch).text}
              >
                {lunch === MealStatus.NOT_EATEN && '❌'}
                {lunch === MealStatus.EATEN_IRREGULAR && '⚠️'}
                {lunch === MealStatus.EATEN_REGULAR && '✅'}
              </button>
            </div>
            <div className="meal-item">
              <span className="meal-name">晚餐</span>
              <button
                type="button"
                className={`meal-checkbox meal-checkbox--${getMealStatusDisplay(dinner).class}`}
                onClick={() => setDinner(cycleMealStatus(dinner))}
                title={getMealStatusDisplay(dinner).text}
              >
                {dinner === MealStatus.NOT_EATEN && '❌'}
                {dinner === MealStatus.EATEN_IRREGULAR && '⚠️'}
                {dinner === MealStatus.EATEN_REGULAR && '✅'}
              </button>
            </div>
          </div>
        </div>

        {/* 内务 */}
        <div className="form-group">
          <label>🏠 内务</label>
          <div className="housework-checkboxes">
            <div className="housework-row">
              <div className="checkbox-item">
                <span>🌞 早洗</span>
                <input
                  type="checkbox"
                  checked={morningWash}
                  onChange={(e) => setMorningWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>🌙 晚洗</span>
                <input
                  type="checkbox"
                  checked={nightWash}
                  onChange={(e) => setNightWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>👕 洗衣</span>
                <input
                  type="checkbox"
                  checked={laundry}
                  onChange={(e) => setLaundry(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>🧹 打扫</span>
                <input
                  type="checkbox"
                  checked={cleaning}
                  onChange={(e) => setCleaning(e.target.checked)}
                />
              </div>
            </div>
            <div className="housework-row">
              <div className="checkbox-item">
                <span>😊 洗脸</span>
                <input
                  type="checkbox"
                  checked={faceWash}
                  onChange={(e) => setFaceWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>🦶 洗脚</span>
                <input
                  type="checkbox"
                  checked={footWash}
                  onChange={(e) => setFootWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>💆 洗头</span>
                <input
                  type="checkbox"
                  checked={hairWash}
                  onChange={(e) => setHairWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>🚿 洗澡</span>
                <input
                  type="checkbox"
                  checked={shower}
                  onChange={(e) => setShower(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>


        {/* 备注 */}
        <div className="form-group">
          <label htmlFor="notes">
            📝 备注
            <span className="quality-hint">（最多50字）</span>
          </label>
          <FormTextarea
            id="notes"
            value={notes}
            onChange={setNotes}
            placeholder="记录今天的日常生活..."
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

export default DailyRecordForm;
