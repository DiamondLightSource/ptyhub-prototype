import React from 'react';
import './CustomTextInput.css';

type Props = {
  value: string
  type: string
  className?: string
  placeholder?: string
  onChange?: (value: string) => void
};

function CustomTextInput({
  value, type, className, placeholder, onChange,
}: Props) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      type={type}
      className={`custom-text-input${className ? ` ${className}` : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={handleTextChange}
    />
  );
}

CustomTextInput.defaultProps = {
  placeholder: '',
  className: '',
  onChange: () => {},
};

export default CustomTextInput;
