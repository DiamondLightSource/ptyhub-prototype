import React, { useEffect, useState } from 'react';
import BackendFileViewerModal from '../BackendFileViewerModal/BackendFileViewerModal';
import openFolder from '../../assets/img/icons/open_folder.svg';
import './BackendFileViewerModalOpener.css';
import CustomTextInput from '../CustomTextInput/CustomTextInput';

interface Props {
  isFolderSelector: boolean
  name?: string
  placeholder?: string
  onSelectedDirectoryChange: (newFile: string) => any
  selectedDirectory: string
}

function BackendFileViewerModalOpener({
  isFolderSelector, name, placeholder, onSelectedDirectoryChange, selectedDirectory,
}: Props) {
  const [folderPath, setFolderPath] = useState<string>('/');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDirectory) {
      setFolderPath(selectedDirectory);
    }
  }, [selectedDirectory]);

  return (
    <div className="backend-file-viewer-modal-opener">
      <div className="backend-file-viewer-modal-opener__form">
        <span>{name}</span>
        <CustomTextInput
          type="text"
          placeholder={placeholder}
          value={selectedDirectory}
          onChange={onSelectedDirectoryChange}
          className="backend-file-viewer-modal-opener__input_box"
        />
        <button type="button" className="backend-file-viewer-modal-opener__button" onClick={() => setIsOpen(true)}>
          <img src={openFolder} alt="Open folder" className="backend-file-viewer-modal-opener__button__image" />
        </button>
      </div>

      <BackendFileViewerModal
        isFolderSelector={isFolderSelector}
        folderPath={folderPath}
        isSaveFile={false}
        handleFolderChange={(newPath) => setFolderPath(newPath)}
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
        handleDirectoryEntrySelected={(newFile) => onSelectedDirectoryChange(newFile)}
      />
    </div>
  );
}

BackendFileViewerModalOpener.defaultProps = {
  name: '',
  placeholder: undefined,
};

export default BackendFileViewerModalOpener;
