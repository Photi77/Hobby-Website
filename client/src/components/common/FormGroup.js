// client/src/components/common/FormGroup.js
import React from 'react';
import './FormGroup.css';

const FormGroup = ({ label, id, error, children }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormGroup;
