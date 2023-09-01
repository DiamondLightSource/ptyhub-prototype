import React from 'react';
import './Seperator.css';

export enum SeperatorOrientation {
  HORIZONTAL,
  VERTICAL,
}

type Props = {
  orientation: SeperatorOrientation
  coloured?: boolean
};

function Seperator({ orientation, coloured }: Props) {
  return (
    <div
      className={
        `seperator ${

          {
            0: 'seperator--horizontal ',
            1: 'seperator--vertical ',
          }[orientation]
        }${coloured ? 'seperator--coloured' : ''}`
      }
    />
  );
}

Seperator.defaultProps = {
  coloured: false,
};

export default Seperator;
