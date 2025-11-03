import React, { useState, useEffect } from 'react';
import { DailyRecord, MealStatus } from '@/utils';
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

  // 表单状态
  const [date, setDate] = useState(getDefaultDate());
  
  // 三餐状态
  const [breakfast, setBreakfast] = useState<MealStatus>(MealStatus.NOT_EATEN);
  const [lunch, setLunch] = useState<MealStatus>(MealStatus.NOT_EATEN);
  const [dinner, setDinner] = useState<MealStatus>(MealStatus.NOT_EATEN);
  
  // 洗漱状态
  const [morningWash, setMorningWash] = useState(false);
  const [nightWash, setNightWash] = useState(false);
  
  // 洗浴状态
  const [shower, setShower] = useState(false);
  const [hairWash, setHairWash] = useState(false);
  const [footWash, setFootWash] = useState(false);
  const [faceWash, setFaceWash] = useState(false);
  
  // 其他状态
  const [laundry, setLaundry] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [wechatSteps, setWechatSteps] = useState('');
  
  // 打卡时间
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [leaveTime, setLeaveTime] = useState('');
  
  // 备注
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(getDefaultDate());
    setBreakfast(MealStatus.NOT_EATEN);
    setLunch(MealStatus.NOT_EATEN);
    setDinner(MealStatus.NOT_EATEN);
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

    // 验证日期格式（至少是2024年10月之后）
    const recordDate = new Date(date);
    const minDate = new Date('2024-10-01');
    if (recordDate < minDate) {
      alert('日期必须从2024年10月开始');
      return;
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

    if (window.confirm('确定添加这条日常记录吗？')) {
      if (editingRecord) {
        onUpdateRecord(dailyRecord);
      } else {
        onAddRecord(dailyRecord);
      }
    }

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

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

        {/* 三餐 */}
        <div className="form-group">
          <label>🍽️ 三餐</label>
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
                <span>早洗</span>
                <input
                  type="checkbox"
                  checked={morningWash}
                  onChange={(e) => setMorningWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>晚洗</span>
                <input
                  type="checkbox"
                  checked={nightWash}
                  onChange={(e) => setNightWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>洗衣</span>
                <input
                  type="checkbox"
                  checked={laundry}
                  onChange={(e) => setLaundry(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>打扫</span>
                <input
                  type="checkbox"
                  checked={cleaning}
                  onChange={(e) => setCleaning(e.target.checked)}
                />
              </div>
            </div>
            <div className="housework-row">
              <div className="checkbox-item">
                <span>洗脸</span>
                <input
                  type="checkbox"
                  checked={faceWash}
                  onChange={(e) => setFaceWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>洗脚</span>
                <input
                  type="checkbox"
                  checked={footWash}
                  onChange={(e) => setFootWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>洗头</span>
                <input
                  type="checkbox"
                  checked={hairWash}
                  onChange={(e) => setHairWash(e.target.checked)}
                />
              </div>
              <div className="checkbox-item">
                <span>洗澡</span>
                <input
                  type="checkbox"
                  checked={shower}
                  onChange={(e) => setShower(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 微信步数 */}
        <div className="form-group">
          <label htmlFor="wechatSteps">👣 微信步数</label>
          <input
            type="number"
            id="wechatSteps"
            value={wechatSteps}
            onChange={(e) => setWechatSteps(e.target.value)}
            placeholder="输入今天的微信步数"
            min="0"
          />
        </div>

        {/* 工作日打卡 */}
        <div className="form-group">
          <label>💼 打卡</label>
          <div className="time-inputs-inline">
            <div className="time-item">
              <span>签到</span>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="time-item">
              <span>签退</span>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
            <div className="time-item">
              <span>离开</span>
              <input
                type="time"
                value={leaveTime}
                onChange={(e) => setLeaveTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="form-group">
          <label htmlFor="notes">备注</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录今天的特殊情况..."
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

export default DailyRecordForm;
