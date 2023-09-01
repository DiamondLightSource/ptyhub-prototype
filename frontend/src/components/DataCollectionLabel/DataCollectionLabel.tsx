import React from 'react';
import './DataCollectionLabel.css';

type Props = {
  name: string,
  value: any,
};

function DataCollectionLabel({ name, value }: Props) {
  return (
    <div className="data-collection-label">
      <div className="data-collection-label__decoration" />
      <div className="data-collection-label__data">
        {name}
        :
        {' '}
        {value}
      </div>
    </div>
  );
}

export default DataCollectionLabel;
