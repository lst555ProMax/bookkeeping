import React, { useEffect, useState } from 'react';
import './Toast.scss';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 2000,
  onClose 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 开始淡出动画的时间 (duration - 300ms)
    const fadeOutTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    // 完全移除的时间 (duration)
    const removeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <div className={`toast toast--${type} ${isExiting ? 'toast--exiting' : ''}`}>
      <span className="toast__icon">{getIcon()}</span>
      <span className="toast__message">{message}</span>
    </div>
  );
};

export default Toast;
