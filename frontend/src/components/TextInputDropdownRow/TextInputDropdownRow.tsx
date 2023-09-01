import React, { forwardRef, useEffect, useMemo } from 'react';
import './TextInputDropdownRow.css';
import plusIcon from '../../assets/img/icons/plus_thick_green.svg';
import crossIcon from '../../assets/img/icons/cross_thick_red.svg';

type Props = {
  value: string
  placeholderText?: string
  hidden?: boolean
  onSubmitted?: (value: string) => void
  onDeleted?: () => void
  onInputBoxFocus?: () => void
  onInputBoxFocusOut?: () => void
  isAdderRow?: boolean
};
const TextInputDropdownRow = forwardRef<HTMLInputElement, Props>(({
  value, placeholderText, hidden, onSubmitted, onDeleted, onInputBoxFocus, onInputBoxFocusOut,
  isAdderRow,
}: Props, ref) => {
  const [temporaryValue, setTemporaryValue] = React.useState<string>('');
  const valueChanged = useMemo(() => temporaryValue !== value, [temporaryValue, value]);

  useEffect(() => {
    setTemporaryValue(value);
  }, [value]);

  useEffect(() => {
    // Clearing the temporary value when the dropdown is closed
    if (hidden) {
      setTemporaryValue(value);
    }
  }, [hidden]);

  const handleValueSubmit = () => {
    if (temporaryValue.trim() === '') return;
    if (onSubmitted) {
      onSubmitted(temporaryValue);
    }

    if (isAdderRow) {
      setTemporaryValue('');
    }
  };
  const handleInputBoxKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleValueSubmit();
    }

    if (event.key === 'Escape') {
      setTemporaryValue(value);
    }
  };

  const handleRightButtonClicked = () => {
    if (valueChanged) {
      handleValueSubmit();
    } else {
      onDeleted?.();
    }
  };

  return (
    <div className={`text-input-dropdown-row ${hidden ? 'text-input-dropdown-row--hidden' : ''}`}>
      {/* We can't use the text input revertable component here as
       we need access to the temporary value for submitting and clearing with buttons */}
      <input
        className="text-input-dropdown-row__input-box"
        type="text"
        value={temporaryValue}
        placeholder={placeholderText}
        ref={ref}
        onChange={(e) => setTemporaryValue(e.target.value)}
        onKeyUp={handleInputBoxKeyUp}
        onFocus={onInputBoxFocus}
        onBlur={onInputBoxFocusOut}
      />
      <button
        type="button"
        className={`text-input-dropdown-row__button 
        ${
          !valueChanged && isAdderRow ? 'text-input-dropdown-row__button--adder-row--no-change' : ''
        }`}
        onClick={handleRightButtonClicked}
      >
        <img
          className="text-input-dropdown-row__button__icon"
          src={valueChanged ? plusIcon : crossIcon}
          alt={valueChanged ? 'Add' : 'Delete'}
        />
      </button>
    </div>
  );
});

TextInputDropdownRow.defaultProps = {
  hidden: false,
  placeholderText: '',
  onSubmitted: () => {},
  onDeleted: () => {},
  onInputBoxFocus: () => {},
  onInputBoxFocusOut: () => {},
  isAdderRow: false,
};

export default TextInputDropdownRow;
