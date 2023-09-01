import React, { useState } from 'react';
import ReactModal from 'react-modal';
import BackendFileViewer from '../BackendFileViewer/BackendFileViewer';
import './BackendFileViewerModal.css';

interface Props {
  isFolderSelector: boolean
  isSaveFile: boolean
  folderPath: string
  handleFolderChange: (newPath: string) => any
  isOpen: boolean
  filesTypes?: string[]
  handleClose: () => any
  handleDirectoryEntrySelected?: (filePath: string) => any
}

const modalStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const modalOverlayStyle: React.CSSProperties = {
  zIndex: '999',
};

function BackendFileViewerModal({
  isFolderSelector,
  isSaveFile,
  filesTypes,
  folderPath,
  handleFolderChange,
  isOpen,
  handleClose,
  handleDirectoryEntrySelected: handleDirectoryEntrySelectedProp,
}: Props) {
  const [fileName, setFileName] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string | undefined>(
    filesTypes && filesTypes.length !== 0 ? filesTypes[0] : undefined,
  );

  const closeModal = handleClose;

  const handleDirectoryEntrySelected = (directoryEntry: string) => {
    if (handleDirectoryEntrySelectedProp) {
      handleDirectoryEntrySelectedProp(directoryEntry);
    }

    // Close the modal when we select a file
    if (directoryEntry) {
      closeModal();
    }
  };

  const handleFileSelected = (file: string) => {
    // It doesn't matter when files are selected in folder selection mode
    if (isFolderSelector || isSaveFile) {
      return;
    }

    handleDirectoryEntrySelected(file);
  };

  const handleSaveFileClicked = () => {
    let filePath = folderPath.endsWith('/') ? `${folderPath}${fileName}` : `${folderPath}/${fileName}`;
    if (filesTypes && filesTypes.length !== 0 && selectedFileType) {
      filePath += selectedFileType;
    }
    handleDirectoryEntrySelected(filePath);
  };

  return (
    <div>
      <ReactModal isOpen={isOpen} style={{ content: modalStyle, overlay: modalOverlayStyle }}>
        <div className="backend-file-viewer-modal__navbar">
          {
            isFolderSelector && (
              <button type="button" onClick={() => handleDirectoryEntrySelected(folderPath)}>
                Select folder
              </button>
            )
          }

          {
            isSaveFile && (
              <div>
                <span>File name</span>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => { setFileName(e.target.value); }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveFileClicked();
                    }
                  }}
                />

                {
                  filesTypes && filesTypes.length !== 0 && (
                    <select
                      value={selectedFileType}
                      onChange={(event) => {
                        setSelectedFileType(event.target.value);
                      }}
                    >
                      {
                        filesTypes.map((fileType) => (
                          <option key={fileType}>{fileType}</option>
                        ))
                      }
                    </select>
                  )
                }
                <button type="button" onClick={handleSaveFileClicked}>Save</button>
              </div>
            )
          }
          <button
            type="button"
            aria-label="Close button"
            className="backend-file-viewer-modal__close"
            onClick={closeModal}
          >
            X
          </button>
        </div>

        <BackendFileViewer
          folderPath={folderPath}
          handleFolderChange={handleFolderChange}
          handleFileSelected={handleFileSelected}
          style={{ flexGrow: 1 }}
        />
      </ReactModal>
    </div>
  );
}

BackendFileViewerModal.defaultProps = {
  handleDirectoryEntrySelected: () => {},
  filesTypes: [],
};

export default BackendFileViewerModal;
