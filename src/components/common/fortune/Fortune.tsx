import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  FortuneRecord, 
  FORTUNE_LEVEL_LABELS, 
  FORTUNE_LEVEL_COLORS,
  FORTUNE_ASPECT_LABELS 
} from '@/utils';
import { 
  getTodayFortune, 
  hasTodayFortune, 
  addFortuneRecord, 
  clearTodayFortuneRecord,
  generateTodayFortune
} from '@/utils';
import './Fortune.scss';

const Fortune: React.FC = () => {
  const [todayFortune, setTodayFortune] = useState<FortuneRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFortune, setGeneratedFortune] = useState<FortuneRecord | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hasResetToday, setHasResetToday] = useState(false); // 记录今天是否重置过

  // 加载今天的运势记录
  useEffect(() => {
    const fortune = getTodayFortune();
    setTodayFortune(fortune);
  }, []);

  // 生成彩带效果
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // 打开算命模态框
  const handleOpenModal = () => {
    if (hasTodayFortune()) {
      alert('今天已经算过命了，明天再来吧！');
      return;
    }
    setShowModal(true);
    setGeneratedFortune(null);
  };
  
  // 打开详情模态框（点击result-card）
  const handleOpenDetailModal = () => {
    if (todayFortune) {
      setGeneratedFortune(todayFortune);
      setShowDetailModal(true);
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    setIsGenerating(false);
    setGeneratedFortune(null);
  };
  
  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setGeneratedFortune(null);
  };

  // 执行算命
  const handleGenerate = () => {
    if (!hasResetToday && hasTodayFortune()) {
      alert('今天已经算过命了！');
      return;
    }

    setIsGenerating(true);

    // 模拟算命动画
    setTimeout(() => {
      try {
        // 如果重置过，使用时间戳生成新结果；否则使用日期生成稳定结果
        const fortune = generateTodayFortune(hasResetToday);
        
        // 保存运势记录
        addFortuneRecord(fortune);
        setTodayFortune(fortune);
        setGeneratedFortune(fortune);
        setIsGenerating(false);
        setHasResetToday(false); // 生成后重置标志
        createConfetti(); // 触发彩带效果
        
        // 不自动关闭，让用户手动关闭
      } catch (error) {
        console.error('算命失败:', error);
        alert('算命失败，请重试');
        setIsGenerating(false);
      }
    }, 2000);
  };

  // 重置今天的运势（调试用）
  const handleReset = () => {
    if (window.confirm('确定要重置今天的运势记录吗？（仅用于调试）\n\n重置后可以重新算命获得不同的结果。')) {
      const deleted = clearTodayFortuneRecord();
      if (deleted) {
        setTodayFortune(null);
        setHasResetToday(true); // 标记已重置
        // 关闭可能打开的详情模态框
        setShowDetailModal(false);
        setGeneratedFortune(null);
      } else {
        alert('今天还没有运势记录');
      }
    }
  };

  return (
    <div className="fortune">
      <div className="fortune__content">
        {todayFortune ? (
          <div className="fortune__result">
            <div 
              className="fortune__result-card"
              onClick={handleOpenDetailModal}
              style={{ 
                borderColor: FORTUNE_LEVEL_COLORS[todayFortune.overallLevel],
                cursor: 'pointer'
              }}
            >
              <div 
                className="fortune__result-level"
                style={{ color: FORTUNE_LEVEL_COLORS[todayFortune.overallLevel] }}
              >
                {FORTUNE_LEVEL_LABELS[todayFortune.overallLevel]}
              </div>
              <div className="fortune__result-score">
                {todayFortune.overallScore}分
              </div>
              <div className="fortune__result-extras">
                <span className="fortune__lucky-item">
                  {todayFortune.luckyColor}
                </span>
                <span className="fortune__lucky-item">
                  {todayFortune.luckyNumber}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button className="fortune__button" onClick={handleOpenModal}>
            🔮 算命
          </button>
        )}
      </div>

      {/* 调试按钮 - 仅在开发环境显示 */}
      {import.meta.env.DEV && todayFortune && (
        <button className="fortune__reset" onClick={handleReset} title="重置运势（仅用于调试）">
          🔄
        </button>
      )}

      {/* 算命模态框 - 使用 Portal 渲染到 body */}
      {showModal && ReactDOM.createPortal(
        <div className="fortune__modal" onClick={handleCloseModal}>
          <div className="fortune__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fortune__modal-close" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="fortune__modal-title">🔮 今日运势</h2>

            {!generatedFortune ? (
              <div className="fortune__generate-area">
                {isGenerating ? (
                  <div className="fortune__generating">
                    <div className="fortune__crystal-ball">🔮</div>
                    <p>测算中...</p>
                  </div>
                ) : (
                  <button className="fortune__generate-button" onClick={handleGenerate}>
                    点击算命
                  </button>
                )}
              </div>
            ) : (
              <div className="fortune__result-area">
                <div 
                  className="fortune__main-result"
                  style={{ 
                    borderColor: FORTUNE_LEVEL_COLORS[generatedFortune.overallLevel],
                    background: `linear-gradient(135deg, ${FORTUNE_LEVEL_COLORS[generatedFortune.overallLevel]}20, transparent)`
                  }}
                >
                  <div 
                    className="fortune__main-level"
                    style={{ color: FORTUNE_LEVEL_COLORS[generatedFortune.overallLevel] }}
                  >
                    {FORTUNE_LEVEL_LABELS[generatedFortune.overallLevel]}
                  </div>
                  <div className="fortune__main-score">
                    综合运势：{generatedFortune.overallScore}分
                  </div>
                </div>

                <div className="fortune__aspects">
                  {generatedFortune.aspects.slice(1).map((aspect) => (
                    <div key={aspect.aspect} className="fortune__aspect-item">
                      <div className="fortune__aspect-header">
                        <span className="fortune__aspect-name">
                          {FORTUNE_ASPECT_LABELS[aspect.aspect]}
                        </span>
                        <span 
                          className="fortune__aspect-level"
                          style={{ color: FORTUNE_LEVEL_COLORS[aspect.level] }}
                        >
                          {FORTUNE_LEVEL_LABELS[aspect.level]} {aspect.score}分
                        </span>
                      </div>
                      <div className="fortune__aspect-desc">
                        {aspect.description}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fortune__extras">
                  <div className="fortune__extra-row">
                    <div className="fortune__extra-item">
                      <span className="fortune__extra-label">🎨 幸运色：</span>
                      <span className="fortune__extra-value">{generatedFortune.luckyColor}</span>
                    </div>
                    <div className="fortune__extra-item">
                      <span className="fortune__extra-label">🔢 幸运数字：</span>
                      <span className="fortune__extra-value">{generatedFortune.luckyNumber}</span>
                    </div>
                  </div>
                  <div className="fortune__extra-item">
                    <span className="fortune__extra-label">💡 今日建议：</span>
                    <span className="fortune__extra-value">{generatedFortune.advice}</span>
                  </div>
                  <div className="fortune__extra-item">
                    <span className="fortune__extra-label">⚠️ 今日禁忌：</span>
                    <span className="fortune__extra-value">{generatedFortune.warning}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 彩带特效 */}
      {showConfetti && ReactDOM.createPortal(
        <div className="fortune__confetti">
          {[...Array(500)].map((_, i) => (
            <div
              key={i}
              className="fortune__confetti-piece"
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

      {/* 详情模态框 - 点击result-card后显示 */}
      {showDetailModal && todayFortune && ReactDOM.createPortal(
        <div className="fortune__modal" onClick={handleCloseDetailModal}>
          <div className="fortune__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fortune__modal-close" onClick={handleCloseDetailModal}>
              ×
            </button>

            <h2 className="fortune__modal-title">🔮 今日运势</h2>

            <div className="fortune__result-area">
              <div 
                className="fortune__main-result"
                style={{ 
                  borderColor: FORTUNE_LEVEL_COLORS[todayFortune.overallLevel],
                  background: `linear-gradient(135deg, ${FORTUNE_LEVEL_COLORS[todayFortune.overallLevel]}20, transparent)`
                }}
              >
                <div 
                  className="fortune__main-level"
                  style={{ color: FORTUNE_LEVEL_COLORS[todayFortune.overallLevel] }}
                >
                  {FORTUNE_LEVEL_LABELS[todayFortune.overallLevel]}
                </div>
                <div className="fortune__main-score">
                  综合运势：{todayFortune.overallScore}分
                </div>
              </div>

              <div className="fortune__aspects">
                {todayFortune.aspects.slice(1).map((aspect) => (
                  <div key={aspect.aspect} className="fortune__aspect-item">
                    <div className="fortune__aspect-header">
                      <span className="fortune__aspect-name">
                        {FORTUNE_ASPECT_LABELS[aspect.aspect]}
                      </span>
                      <span 
                        className="fortune__aspect-level"
                        style={{ color: FORTUNE_LEVEL_COLORS[aspect.level] }}
                      >
                        {FORTUNE_LEVEL_LABELS[aspect.level]} {aspect.score}分
                      </span>
                    </div>
                    <div className="fortune__aspect-desc">
                      {aspect.description}
                    </div>
                  </div>
                ))}
              </div>

              <div className="fortune__extras">
                <div className="fortune__extra-row">
                  <div className="fortune__extra-item">
                    <span className="fortune__extra-label">🎨 幸运色：</span>
                    <span className="fortune__extra-value">{todayFortune.luckyColor}</span>
                  </div>
                  <div className="fortune__extra-item">
                    <span className="fortune__extra-label">🔢 幸运数字：</span>
                    <span className="fortune__extra-value">{todayFortune.luckyNumber}</span>
                  </div>
                </div>
                <div className="fortune__extra-item">
                  <span className="fortune__extra-label">💡 今日建议：</span>
                  <span className="fortune__extra-value">{todayFortune.advice}</span>
                </div>
                <div className="fortune__extra-item">
                  <span className="fortune__extra-label">⚠️ 今日禁忌：</span>
                  <span className="fortune__extra-value">{todayFortune.warning}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Fortune;
