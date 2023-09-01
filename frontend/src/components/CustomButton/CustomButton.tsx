import React from 'react';
import './CustomButton.css';

type Props = {
  text?: string,
  icon?: string,
  disabled?: boolean
  onClick?: () => void
};

function CustomButton({
  text, icon, disabled, onClick,
}: Props) {
  return (
    <button type="button" className="custom-button" onClick={onClick} disabled={disabled}>
      {
        text || ''
      }

      {
        icon
        && <img src={icon} alt={`${text || ''} icon`} />
      }
    </button>
  );
}

CustomButton.defaultProps = {
  text: '',
  icon: '',
  disabled: false,
  onClick: () => {},
};

export default CustomButton;
