import React from 'react';
import './Subsection.css';

type Props = {
  children: React.ReactNode
  style?: React.CSSProperties
};

function Subsection({ children, style }: Props) {
  return (
    <div className="subsection" style={style}>
      {children}
    </div>
  );
}

Subsection.defaultProps = {
  style: {},
};

export default Subsection;
