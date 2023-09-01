import React from 'react';
import './SubsectionTitle.css';

type Props = {
  title: string
};

function SubsectionTitle({ title }: Props) {
  return (
    <h3 className="subsection-title">{title}</h3>
  );
}

export default SubsectionTitle;
