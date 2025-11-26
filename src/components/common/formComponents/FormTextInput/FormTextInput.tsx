import React from 'react';
import './FormTextInput.scss';

interface FormTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

const FormTextInput: React.FC<FormTextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  id,
  required = false,
  disabled = false,
  maxLength
}) => {
  return (
    <input
      type="text"
      id={id}
      className={`form-text-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
};

export default FormTextInput;

