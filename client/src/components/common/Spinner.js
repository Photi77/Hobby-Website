// client/src/components/common/Spinner.js
import React from 'react';
import './Spinner.css';

const Spinner = ({ type = 'default', size = 'md', color = 'primary', text, overlay = false }) => {
  // スピナーのサイズクラスを決定
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  
  // スピナーの色クラスを決定
  const colorClass = `spinner-${color}`;
  
  // スピナータイプに基づいてレンダリング
  const renderSpinner = () => {
    switch (type) {
      case 'pulse':
        return <div className={`spinner-pulse ${colorClass} ${sizeClass}`}></div>;
      
      case 'dots':
        return (
          <div className="spinner-dots">
            <div className={`spinner-dot ${colorClass}`}></div>
            <div className={`spinner-dot ${colorClass}`}></div>
            <div className={`spinner-dot ${colorClass}`}></div>
          </div>
        );
      
      case 'progress':
        return (
          <div className="progress-bar">
            <div className={`progress-bar-fill ${colorClass}`} style={{ width: '50%' }}></div>
          </div>
        );
      
      case 'indeterminate':
        return (
          <div className="progress-bar progress-bar-indeterminate">
            <div className={`progress-bar-fill ${colorClass}`}></div>
          </div>
        );
      
      case 'default':
      default:
        return <div className={`spinner ${colorClass} ${sizeClass}`}></div>;
    }
  };
  
  // テキスト付きのスピナー
  if (text) {
    return (
      <div className={overlay ? 'spinner-overlay' : 'spinner-container'}>
        <div className="spinner-with-text">
          {renderSpinner()}
          <p className="spinner-text">{text}</p>
        </div>
      </div>
    );
  }
  
  // 通常のスピナー
  return (
    <div className={overlay ? 'spinner-overlay' : 'spinner-container'}>
      {renderSpinner()}
    </div>
  );
};

export default Spinner;