import React, { ReactNode } from 'react';
import './RecordListHeader.scss';

interface RecordListHeaderProps {
  title: string;
  count: number;
  className?: string;
  searchSection?: ReactNode;
  actions?: ReactNode;
}

const RecordListHeader: React.FC<RecordListHeaderProps> = ({
  title,
  count,
  className = '',
  searchSection,
  actions
}) => {
  return (
    <div className={`record-list-header ${className}`}>
      <h3 className="record-list-header__title">{title} ({count})</h3>
      {searchSection && (
        <div className="record-list-header__search">
          {searchSection}
        </div>
      )}
      {actions && (
        <div className="record-list-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default RecordListHeader;

