import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import { CardDrawRecord, CardType, CARD_TYPE_LABELS, CARD_CATEGORY_LABELS } from '@/utils';
import { 
  getTodayCardDraw, 
  hasTodayDrawn, 
  addCardDrawRecord, 
  clearTodayCardDrawRecord,
  loadActivityConfig,
  drawCardByConfig
} from '@/utils';
import ActivityManager from './ActivityManager';
import './CardDraw.scss';

const CardDraw: React.FC = () => {
  const [todayCard, setTodayCard] = useState<CardDrawRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardDrawRecord | null>(null);
  const [customContent, setCustomContent] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showActivityManager, setShowActivityManager] = useState(false);
  const [activityConfig, setActivityConfig] = useState(loadActivityConfig());

  // 加载今天的抽卡记录
  useEffect(() => {
    const card = getTodayCardDraw();
    setTodayCard(card);
  }, []);

  // 重新加载配置
  const reloadConfig = () => {
    setActivityConfig(loadActivityConfig());
  };

  // 生成彩带效果
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // 打开抽卡模态框
  const handleOpenModal = () => {
    setShowModal(true);
    if (todayCard) {
      // 如果已经抽过卡，显示抽卡结果
      setDrawnCard(todayCard);
    } else {
      setDrawnCard(null);
      setCustomContent('');
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    setIsDrawing(false);
    setDrawnCard(null);
    setCustomContent('');
  };

  // 执行抽卡
  const handleDraw = () => {
    if (hasTodayDrawn()) {
      toast('今天已经抽过卡了！', { icon: '⚠️' });
      return;
    }

    setIsDrawing(true);

    // 模拟抽卡动画
    setTimeout(() => {
      try {
        const config = loadActivityConfig();
        const result = drawCardByConfig(config);
        const today = new Date().toISOString().split('T')[0];
        
        const newRecord: CardDrawRecord = {
          id: `card_${Date.now()}`,
          date: today,
          cardType: result.cardType,
          category: result.category,
          createdAt: new Date()
        };

        // 如果是自定义类型，需要先输入内容
        if (result.cardType === CardType.CUSTOM) {
          setDrawnCard(newRecord);
          setIsDrawing(false);
        } else {
          // 非自定义类型直接保存
          addCardDrawRecord(newRecord);
          setTodayCard(newRecord);
          setDrawnCard(newRecord);
          setIsDrawing(false);
          createConfetti(); // 触发彩带效果
          
          // 延迟关闭模态框，让用户看到结果
          setTimeout(() => {
            handleCloseModal();
          }, 3000);
        }
      } catch (error) {
        console.error('抽卡失败:', error);
        toast.error('抽卡失败，请重试');
        setIsDrawing(false);
      }
    }, 2000);
  };

  // 确认抽卡结果（用于自定义内容）
  const handleConfirm = () => {
    if (!drawnCard) return;

    // 如果是自定义类型，需要输入内容
    if (drawnCard.cardType === CardType.CUSTOM) {
      const trimmedContent = customContent.trim();
      if (!trimmedContent) {
        toast.error('请输入自定义内容！');
        return;
      }
      
      if (trimmedContent.length > 20) {
        toast.error('自定义内容不能超过20个字符');
        return;
      }
      
      drawnCard.customContent = trimmedContent;
    }

    try {
      // 保存抽卡记录
      addCardDrawRecord(drawnCard);
      setTodayCard(drawnCard);
      createConfetti(); // 触发彩带效果
      
      // 延迟关闭，让用户看到结果
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error('保存抽卡记录失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  // 重置今天的抽卡（调试用）
  const handleReset = () => {
    if (window.confirm('确定要重置今天的抽卡记录吗？（仅用于调试）')) {
      const deleted = clearTodayCardDrawRecord();
      if (deleted) {
        setTodayCard(null);
        toast.success('已重置抽卡记录');
      } else {
        toast('今天还没有抽卡记录', { icon: '⚠️' });
      }
    }
  };

  return (
    <div className="card-draw">
      <div className="card-draw__content">
        {todayCard ? (
          <div className="card-draw__result" onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
            <div className="card-draw__result-title">今日任务</div>
            <div className="card-draw__result-card">
              <div className="card-draw__result-category">
                {CARD_CATEGORY_LABELS[todayCard.category]}
              </div>
              <div className="card-draw__result-type">
                {todayCard.cardType === CardType.CUSTOM && todayCard.customContent
                  ? todayCard.customContent
                  : CARD_TYPE_LABELS[todayCard.cardType]}
              </div>
            </div>
          </div>
        ) : (
          <button className="card-draw__button" onClick={handleOpenModal}>
            🎴 抽卡
          </button>
        )}
      </div>

      {/* 调试按钮 - 仅在开发环境显示 */}
      {import.meta.env.DEV && todayCard && (
        <button className="card-draw__reset" onClick={handleReset} title="重置抽卡（仅用于调试）">
          🔄
        </button>
      )}

      {/* 抽卡模态框 - 使用 Portal 渲染到 body */}
      {showModal && ReactDOM.createPortal(
        <div className="card-draw__modal" onClick={handleCloseModal}>
          <div className="card-draw__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="card-draw__modal-close" onClick={handleCloseModal}>
              ×
            </button>

            <button 
              className="card-draw__settings-icon" 
              onClick={() => setShowActivityManager(true)}
              title="管理配置"
            >
              ⚙️
            </button>

            <h2 className="card-draw__modal-title">🎴 晚上活动抽卡</h2>

            {!drawnCard ? (
              <div className="card-draw__draw-area">
                {isDrawing ? (
                  <div className="card-draw__drawing">
                    <div className="card-draw__card-flip">🎴</div>
                    <p>抽卡中...</p>
                  </div>
                ) : hasTodayDrawn() ? (
                  <div className="card-draw__already-drawn">
                    <p>今天已经抽过卡了，明天再来吧！</p>
                  </div>
                ) : (
                  <button className="card-draw__draw-button" onClick={handleDraw}>
                    点击抽卡
                  </button>
                )}
              </div>
            ) : (
              <div className="card-draw__result-area">
                <div className="card-draw__drawn-card">
                  <div className="card-draw__drawn-category">
                    {CARD_CATEGORY_LABELS[drawnCard.category]}
                  </div>
                  <div className="card-draw__drawn-type">
                    {drawnCard.cardType === CardType.CUSTOM && drawnCard.customContent
                      ? drawnCard.customContent
                      : CARD_TYPE_LABELS[drawnCard.cardType]}
                  </div>
                </div>

                {/* 只有当卡片是自定义且还没有内容时才显示输入框 */}
                {drawnCard.cardType === CardType.CUSTOM && !drawnCard.customContent && (
                  <>
                    <div className="card-draw__custom-input">
                      <label>请输入自定义内容：</label>
                      <input
                        type="text"
                        value={customContent}
                        onChange={(e) => setCustomContent(e.target.value)}
                        placeholder="今晚要做什么呢..."
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleConfirm();
                          }
                        }}
                      />
                    </div>
                    <div className="card-draw__actions">
                      <button className="card-draw__confirm" onClick={handleConfirm}>
                        确认
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="card-draw__probability">
              <p className="card-draw__probability-title">概率说明：</p>
              <ul>
                {activityConfig.map(category => {
                  const categoryProb = Math.round(category.totalProbability * 100);
                  const itemsText = category.items
                    .map(item => `${item.name} ${Math.round(item.probability * 100)}%`)
                    .join('、');
                  return (
                    <li key={category.id}>
                      {category.name} {categoryProb}%
                      {category.items.length > 0 && `：${itemsText}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 彩带特效 */}
      {showConfetti && ReactDOM.createPortal(
        <div className="card-draw__confetti">
          {[...Array(500)].map((_, i) => (
            <div
              key={i}
              className="card-draw__confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {/* 活动配置管理器 */}
      {showActivityManager && (
        <ActivityManager
          onClose={() => setShowActivityManager(false)}
          onConfigChange={reloadConfig}
        />
      )}
    </div>
  );
};

export default CardDraw;
