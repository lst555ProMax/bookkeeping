import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import DatePicker from '../DatePicker/DatePicker';
import { 
  getTodayAgeRecord, 
  hasTodayAgeRecord, 
  addAgeRecord, 
  clearTodayAgeRecord,
  AgeRecord
} from '@/utils';
import './AgeCalculator.scss';

const AgeCalculator: React.FC = () => {
  const [todayRecord, setTodayRecord] = useState<AgeRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [birthday, setBirthday] = useState<string>('2005-01-01'); // YYYY-MM-DD格式，默认2005年1月1日
  const [currentAge, setCurrentAge] = useState<string>(''); // 当前年龄（年）
  const [detailedAge, setDetailedAge] = useState<string>(''); // 详细年龄（年月日时分秒）
  const [isCalculating, setIsCalculating] = useState(false); // 是否正在计算
  const [calculatedAge, setCalculatedAge] = useState<string>(''); // 计算后的年龄（用于modal中显示）
  const [showConfetti, setShowConfetti] = useState(false); // 是否显示彩带效果

  // 计算年龄（年，精确到小数点后两位）
  const calculateAgeInYears = (birthdayStr: string): number => {
    const birthDate = new Date(birthdayStr);
    const now = new Date();
    const diffMs = now.getTime() - birthDate.getTime();
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return diffYears;
  };

  // 计算详细年龄（年月日时分秒）
  const calculateDetailedAge = (birthdayStr: string): string => {
    const birthDate = new Date(birthdayStr);
    const now = new Date();
    
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    // 处理借位
    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    return `${years}岁${months}月${days}日${hours}时${minutes}分${seconds}秒`;
  };

  // 计算年龄
  const calculateAge = useCallback((birthdayStr: string) => {
    const ageInYears = calculateAgeInYears(birthdayStr);
    setCurrentAge(ageInYears.toFixed(2));
    setDetailedAge(calculateDetailedAge(birthdayStr));
  }, []);

  // 加载今天的年龄记录
  useEffect(() => {
    const record = getTodayAgeRecord();
    setTodayRecord(record);
    if (record) {
      // 解析生日并设置状态
      const [date] = record.birthday.split(' ');
      setBirthday(date);
      // 计算初始年龄
      calculateAge(record.birthday);
    }
  }, [calculateAge]);

  // 每秒更新详细年龄（在详情modal中）
  useEffect(() => {
    if (todayRecord && showDetailModal) {
      calculateAge(todayRecord.birthday);
      const interval = setInterval(() => {
        calculateAge(todayRecord.birthday);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [todayRecord, showDetailModal, calculateAge]);

  // 打开模态框
  const handleOpenModal = () => {
    if (hasTodayAgeRecord()) {
      // 如果已经计算过，打开详情modal
      setShowDetailModal(true);
      return;
    }
    setShowModal(true);
    setBirthday('2005-01-01'); // 默认值为2005年1月1日
  };

  // 生成彩带效果
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    setIsCalculating(false);
    setBirthday('2005-01-01'); // 重置为默认值
    setCalculatedAge('');
  };

  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  // 确认计算年龄
  const handleConfirm = () => {
    if (!birthday) {
      toast.error('请选择生日');
      return;
    }

    setIsCalculating(true);

    // 模拟计算动画
    setTimeout(() => {
      try {
        // 组合生日和时间：YYYY-MM-DD HH:mm:ss，默认时间为00:00:00
        const birthdayStr = `${birthday} 00:00:00`;
        
        const today = new Date().toISOString().split('T')[0];
        const newRecord: AgeRecord = {
          id: `age_${Date.now()}`,
          date: today,
          birthday: birthdayStr,
          createdAt: new Date()
        };

        // 计算年龄
        const ageInYears = calculateAgeInYears(birthdayStr);
        const ageStr = ageInYears.toFixed(2);

        // 保存记录
        addAgeRecord(newRecord);
        setTodayRecord(newRecord);
        calculateAge(birthdayStr);
        setCalculatedAge(ageStr);
        setIsCalculating(false);
        createConfetti(); // 触发彩带效果
        
        // 延迟关闭模态框，让用户看到结果
        setTimeout(() => {
          handleCloseModal();
        }, 3000);
      } catch (error) {
        console.error('计算年龄失败:', error);
        toast.error('计算失败，请重试');
        setIsCalculating(false);
      }
    }, 2000);
  };

  // 重置今天的年龄记录（调试用）
  const handleReset = () => {
    if (window.confirm('确定要重置今天的年龄记录吗？（仅用于调试）\n\n重置后可以重新输入生日进行计算。')) {
      const deleted = clearTodayAgeRecord();
      if (deleted) {
        setTodayRecord(null);
        setCurrentAge('');
        setDetailedAge('');
        toast.success('已重置年龄记录');
        setShowDetailModal(false);
      } else {
        toast('今天还没有年龄记录', { icon: '⚠️' });
      }
    }
  };

  return (
    <div className="age-calculator">
      <div className="age-calculator__content">
        {todayRecord ? (
          <div 
            className="age-calculator__result" 
            onClick={handleOpenModal}
            style={{ cursor: 'pointer' }}
          >
            <div className="age-calculator__result-title">今日年龄</div>
            <div className="age-calculator__result-card">
              <div className="age-calculator__result-age">
                {currentAge}岁
              </div>
            </div>
          </div>
        ) : (
          <button className="age-calculator__button" onClick={handleOpenModal}>
            🎂 今日年龄
          </button>
        )}
      </div>

      {/* 调试按钮 - 仅在开发环境显示 */}
      {import.meta.env.DEV && todayRecord && (
        <button className="age-calculator__reset" onClick={handleReset} title="重置年龄（仅用于调试）">
          🔄
        </button>
      )}

      {/* 年龄计算模态框 */}
      {showModal && ReactDOM.createPortal(
        <div className="age-calculator__modal" onClick={handleCloseModal}>
          <div className="age-calculator__modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="age-calculator__modal-title">🎂 今日年龄</h2>

            {!calculatedAge ? (
              <div className="age-calculator__generate-area">
                {isCalculating ? (
                  <div className="age-calculator__calculating">
                    <div className="age-calculator__cake">🎂</div>
                    <p>计算中...</p>
                  </div>
                ) : (
                  <>
                    <div className="age-calculator__form">
                      <div className="age-calculator__form-item">
                        <DatePicker
                          value={birthday}
                          onChange={setBirthday}
                          maxDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <button 
                      className="age-calculator__generate-button"
                      onClick={handleConfirm}
                      disabled={!birthday}
                    >
                      点击计算
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="age-calculator__result-area">
                <div className="age-calculator__main-result">
                  <div className="age-calculator__main-age">
                    {calculatedAge}岁
                  </div>
                  <div className="age-calculator__main-label">
                    您的年龄
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 详情模态框 - 点击result后显示 */}
      {showDetailModal && todayRecord && ReactDOM.createPortal(
        <div className="age-calculator__modal" onClick={handleCloseDetailModal}>
          <div className="age-calculator__modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="age-calculator__modal-title">🎂 今日年龄</h2>

            <div className="age-calculator__result-area">
              <div className="age-calculator__detail-label">
                您今日的具体年龄是
              </div>
              <div className="age-calculator__detail-age">
                {detailedAge}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 彩带特效 */}
      {showConfetti && ReactDOM.createPortal(
        <div className="age-calculator__confetti">
          {[...Array(500)].map((_, i) => (
            <div
              key={i}
              className="age-calculator__confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#a78bfa'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default AgeCalculator;
