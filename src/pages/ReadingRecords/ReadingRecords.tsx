import React from 'react';
import './ReadingRecords.scss';

const ReadingRecords: React.FC = () => {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-page__content">
        <div className="icon">📚</div>
        <h2>读记</h2>
        <p className="description">记录阅读历程，积累知识财富</p>
        <div className="status">敬请期待...</div>
      </div>
    </div>
  );
};

export default ReadingRecords;
