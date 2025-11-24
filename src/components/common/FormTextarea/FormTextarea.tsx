import React from 'react';
import './FormTextarea.scss';

interface FormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  id,
  required = false,
  disabled = false,
  maxLength,
  rows = 4
}) => {
  return (
    <textarea
      id={id}
      className={`form-textarea ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      rows={rows}
    />
  );
};

export default FormTextarea;

