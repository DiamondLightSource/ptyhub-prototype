import React from 'react';
import './TitledElement.css';

interface Props {
  title: string
  children: React.ReactNode
}

function TitledElement({ title, children }: Props) {
  return (
    <div>
      <span className="titledElement__title">{title}</span>
      {
        children
      }
    </div>
  );
}

export default TitledElement;
