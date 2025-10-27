import React, { useState, useEffect } from 'react';
import { DailyRecord, MealStatus } from '@/types';
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

        {/* 三餐情况 */}
        <div className="form-section">
          <h3 className="section-title">🍽️ 三餐情况</h3>
          <div className="meal-buttons">
            <button
              type="button"
              className={`meal-btn meal-btn--${getMealStatusDisplay(breakfast).class}`}
              onClick={() => setBreakfast(cycleMealStatus(breakfast))}
            >
              <span className="meal-label">早餐</span>
              <span className="meal-status">{getMealStatusDisplay(breakfast).text}</span>
            </button>
            <button
              type="button"
              className={`meal-btn meal-btn--${getMealStatusDisplay(lunch).class}`}
              onClick={() => setLunch(cycleMealStatus(lunch))}
            >
              <span className="meal-label">午餐</span>
              <span className="meal-status">{getMealStatusDisplay(lunch).text}</span>
            </button>
            <button
              type="button"
              className={`meal-btn meal-btn--${getMealStatusDisplay(dinner).class}`}
              onClick={() => setDinner(cycleMealStatus(dinner))}
            >
              <span className="meal-label">晚餐</span>
              <span className="meal-status">{getMealStatusDisplay(dinner).text}</span>
            </button>
          </div>
        </div>

        {/* 洗漱情况 */}
        <div className="form-section">
          <h3 className="section-title">🧼 洗漱情况</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={morningWash}
                onChange={(e) => setMorningWash(e.target.checked)}
              />
              <span>早上洗漱</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={nightWash}
                onChange={(e) => setNightWash(e.target.checked)}
              />
              <span>晚上洗漱</span>
            </label>
          </div>
        </div>

        {/* 洗浴情况 */}
        <div className="form-section">
          <h3 className="section-title">🚿 洗浴情况</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={shower}
                onChange={(e) => setShower(e.target.checked)}
              />
              <span>洗澡</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={hairWash}
                onChange={(e) => setHairWash(e.target.checked)}
              />
              <span>洗头</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={footWash}
                onChange={(e) => setFootWash(e.target.checked)}
              />
              <span>洗脚</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={faceWash}
                onChange={(e) => setFaceWash(e.target.checked)}
              />
              <span>洗脸</span>
            </label>
          </div>
        </div>

        {/* 洗衣服和打扫 */}
        <div className="form-section">
          <h3 className="section-title">🏠 家务情况</h3>
          <div className="radio-group">
            <div className="radio-item">
              <label className="radio-item-label">洗衣服</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="laundry"
                    checked={laundry === true}
                    onChange={() => setLaundry(true)}
                  />
                  <span>是</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="laundry"
                    checked={laundry === false}
                    onChange={() => setLaundry(false)}
                  />
                  <span>否</span>
                </label>
              </div>
            </div>
            <div className="radio-item">
              <label className="radio-item-label">打扫</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="cleaning"
                    checked={cleaning === true}
                    onChange={() => setCleaning(true)}
                  />
                  <span>是</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="cleaning"
                    checked={cleaning === false}
                    onChange={() => setCleaning(false)}
                  />
                  <span>否</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 工作日打卡 */}
        <div className="form-section">
          <h3 className="section-title">💼 工作日打卡</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="checkInTime">签到时间</label>
              <input
                type="time"
                id="checkInTime"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkOutTime">签退时间</label>
              <input
                type="time"
                id="checkOutTime"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="leaveTime">离开时间</label>
              <input
                type="time"
                id="leaveTime"
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
