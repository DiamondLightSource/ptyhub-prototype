import React from 'react';
import CustomButton from '../CustomButton/CustomButton';

type Props = {
  multiple?: boolean
  accept?: string
  onFilesSelected?: (files: File[]) => void
};

function LoadFromFileButton({ multiple, accept, onFilesSelected }: Props) {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple === undefined ? false : multiple;
    input.accept = accept === undefined ? '*.*' : accept;
    input.onchange = () => {
      if (!input.files) {
        return;
      }
      // you can use this method to get file and perform respective operations
      const files = Array.from(input.files);

      if (onFilesSelected) {
        onFilesSelected(files);
      }
    };
    input.click();
  };

  return (
    <CustomButton text="Frontend load" onClick={handleClick} />
  );
}

LoadFromFileButton.defaultProps = {
  multiple: false,
  accept: '*.*',
  onFilesSelected: () => {},
};

export default LoadFromFileButton;
