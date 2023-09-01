import React, { useMemo } from 'react';
import { Panel, PanelProps } from 'react-resizable-panels';

type Props = {
  overflowDirection: 'horizontal' | 'vertical' | 'both';
} & PanelProps;

function PanelOverflowable({ overflowDirection, style, ...props }: Props) {
  const finalStyle = useMemo<React.CSSProperties>(() => {
    const newStyleParts: React.CSSProperties = {};
    if (style) {
      Object.assign(newStyleParts, style);
    }

    if (overflowDirection === 'horizontal' || overflowDirection === 'both') {
      newStyleParts.overflowX = 'auto';
    }

    if (overflowDirection === 'vertical' || overflowDirection === 'both') {
      newStyleParts.overflowY = 'auto';
    }

    return newStyleParts;
  }, [style, overflowDirection]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Panel style={finalStyle} {...props} />
  );
}

export default PanelOverflowable;
