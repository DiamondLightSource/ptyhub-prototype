import React, { useMemo } from 'react';
import { PanelResizeHandle, PanelResizeHandleProps } from 'react-resizable-panels';
import './CustomPanelResizeHandle.css';

type Props = {
  direction: 'horizontal' | 'vertical'
} & PanelResizeHandleProps;

function CustomPanelResizeHandle({ className, direction, ...props }: Props) {
  const finalClassName = useMemo<string>(() => {
    const parts = [];
    if (className) {
      parts.push(className);
    }

    parts.push('custom-panel-resize-handle');
    parts.push(`custom-panel-resize-handle--${direction}`);

    return parts.join(' ');
  }, [className, direction]);

  return (
    <PanelResizeHandle
      className={finalClassName} // Adding our class to props className
      /* eslint-disable react/jsx-props-no-spreading */
      {...props}
    />
  );
}

export default CustomPanelResizeHandle;
