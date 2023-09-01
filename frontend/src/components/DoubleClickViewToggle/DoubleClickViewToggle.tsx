import React from 'react';

type Props = {
  defaultView: React.ReactNode,
  doubleClickView: React.ReactNode,
  inDoubleClickMode: boolean,
  onClick?: () => void,
  onDoubleClick?: () => void,
  allowDoubleClick?: boolean,
};

function DoubleClickViewToggle({
  defaultView,
  doubleClickView,
  inDoubleClickMode,
  onClick,
  onDoubleClick,
  allowDoubleClick,
}: Props) {
  const lastClickTimestamp = React.useRef<number>(0);

  const handleClick = () => {
    if (onClick) onClick();

    const currentTimestamp = new Date().getTime();
    if (allowDoubleClick && currentTimestamp - lastClickTimestamp.current < 300) {
      if (onDoubleClick) onDoubleClick();
    }

    lastClickTimestamp.current = currentTimestamp;
  };

  const modifiedDefaultView = React.cloneElement(defaultView as React.ReactElement, {
    onClick: handleClick,
  });

  return inDoubleClickMode ? (
    <div>
      { doubleClickView }
    </div>
  ) : (
    <div>
      { modifiedDefaultView }
    </div>
  );
}

DoubleClickViewToggle.defaultProps = {
  allowDoubleClick: true,
  onClick: () => {},
  onDoubleClick: () => {},
};

export default DoubleClickViewToggle;
