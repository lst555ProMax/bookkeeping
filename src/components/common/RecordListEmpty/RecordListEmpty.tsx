import React from 'react';
import './RecordListEmpty.scss';

interface RecordListEmptyProps {
  icon: string;
  message: string;
  hint?: string;
  className?: string;
}

const RecordListEmpty: React.FC<RecordListEmptyProps> = ({
  icon,
  message,
  hint,
  className = ''
}) => {
  return (
    <div className={`record-list-empty ${className}`}>
      <div className="record-list-empty__icon">{icon}</div>
      <p className="record-list-empty__message">{message}</p>
      {hint && <p className="record-list-empty__hint">{hint}</p>}
    </div>
  );
};

export default RecordListEmpty;

