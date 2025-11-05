import React from 'react';
import './Music.scss';

const Music: React.FC = () => {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-page__content">
        <div className="icon">🎵</div>
        <h2>乐记</h2>
        <p className="description">记录聆听时光,感受音乐魅力</p>
        <div className="status">敬请期待...</div>
      </div>
    </div>
  );
};

export default Music;
