// client/src/components/common/Alert.js
import React from 'react';
import './Alert.css';

const Alert = ({ type, message }) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
};

export default Alert;


