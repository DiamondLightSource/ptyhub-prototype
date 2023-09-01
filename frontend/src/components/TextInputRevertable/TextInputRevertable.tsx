import React, { forwardRef, useEffect } from 'react';

type Props = {
  defaultValue: string;
  onValueChange: (value: string) => void;
  onFocused?: () => void;
  onFocusOut?: () => void;
  className?: string;
  placeholder?: string;
  clearTemporaryValueOnSubmit?: boolean;
};
const TextInputRevertable = forwardRef<HTMLInputElement, Props>(({
  defaultValue, onValueChange, onFocused, onFocusOut, className,
  placeholder, clearTemporaryValueOnSubmit,
}: Props, ref: React.ForwardedRef<HTMLInputElement>) => {
  const [temporaryValue, setTemporaryValue] = React.useState<string>('');

  useEffect(() => {
    setTemporaryValue(defaultValue);
  }, [defaultValue]);

  const blurInput = () => {
    if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement>).current.blur();
    }
  };

  const handleValueSubmit = () => {
    if (temporaryValue.trim() === '') return;
    blurInput();
    if (onValueChange) {
      onValueChange(temporaryValue);
    }

    if (clearTemporaryValueOnSubmit) {
      setTemporaryValue('');
    }
  };
  const handleInputBoxKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleValueSubmit();
    }

    if (event.key === 'Escape') {
      setTemporaryValue(defaultValue);
      blurInput();
    }
  };

  return (
    <input
      className={className}
      type="text"
      value={temporaryValue}
      placeholder={placeholder}
      ref={ref}
      onChange={(e) => setTemporaryValue(e.target.value)}
      onKeyUp={handleInputBoxKeyUp}
      onFocus={onFocused}
      onBlur={onFocusOut}
    />
  );
});

TextInputRevertable.defaultProps = {
  className: undefined,
  placeholder: undefined,
  clearTemporaryValueOnSubmit: false,
  onFocused: () => {},
  onFocusOut: () => {},
};

export default TextInputRevertable;
