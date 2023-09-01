/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @author Thomas Milburn
 * @copyright 2020
 * @license MIT
 */

import {
  ChonkyActions,
  ChonkyFileActionData,
  FileArray,
  FileBrowser,
  FileData,
  FileList,
  FileNavbar,
  FileToolbar,
  setChonkyDefaults,
} from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import path from 'path-browserify';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FileControllerService } from '../../network/services/FileControllerService';

setChonkyDefaults({ iconComponent: ChonkyIconFA });

// eslint-disable-next-line max-len
const fetchBackendFolder = (
  directoryPath: string,
): Promise<FileArray> => FileControllerService.getDirectoryContent(directoryPath)
  .then((directoryContents) => {
    const chonkyFiles: FileArray = directoryContents.entries.map((dirEntry) => ({
      id: path.join(directoryContents.path, dirEntry.name),
      name: dirEntry.name,
      isDir: dirEntry.is_dir,
    } as FileData));

    return chonkyFiles;
  });

interface Props {
  folderPath: string
  handleFolderChange: (newPath: string) => any
  handleFileSelected?: (filePath: string) => any,
  style?: React.CSSProperties
}

function BackendFileViewer({
  folderPath, handleFolderChange, handleFileSelected, style,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileArray>([]);

  const updateFolder = () => {
    fetchBackendFolder(folderPath)
      .then(setFiles)
      .catch((_error) => setError(_error.message));
  };

  useEffect(updateFolder, [folderPath, setFiles]);

  const folderChain = React.useMemo(() => {
    let newFolderChain: FileArray;
    if (folderPath === '/') {
      newFolderChain = [];
    } else {
      let currentPrefix = '';
      newFolderChain = folderPath
        // Remove final slash
        .replace(/\/$/, '')
        // Remove first slash
        .replace(/\/*/, '')
        .split('/')
        .map(
          (prefixPart): FileData => {
            currentPrefix = currentPrefix
              ? path.join(currentPrefix, prefixPart)
              : prefixPart;
            return {
              id: currentPrefix,
              name: prefixPart,
              isDir: true,
            };
          },
        );

      newFolderChain.unshift({
        id: '/',
        name: '/',
        isDir: true,
      });
    }

    setError(null);
    return newFolderChain;
  }, [folderPath]);

  const handleFileAction = useCallback(
    (data: ChonkyFileActionData) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        if (data.payload.files && data.payload.files.length !== 1) return;
        if (!data.payload.targetFile) return;

        if (data.payload.targetFile.isDir) {
          // Folder selected
          let newPrefix = `${data.payload.targetFile.id.replace(/\/*$/, '')}/`;

          if (!newPrefix.startsWith('/')) {
            newPrefix = `/${newPrefix}`;
          }

          handleFolderChange(newPrefix);
        } else if (handleFileSelected) {
          // File selected
          handleFileSelected(data.payload.targetFile.id);
        }
      }
      if (data.id === ChonkyActions.CreateFolder.id) {
        // Create a new folder, using built in browser prompt
        // This could be changed to a nice modal in the future
        const folderName = prompt('Please enter the name for the folder');

        if (folderName === null) {
          return;
        }

        let newFolderFullPath = folderPath;
        if (newFolderFullPath.endsWith('/')) {
          newFolderFullPath += folderName;
        } else {
          newFolderFullPath += `/${folderName}`;
        }
        FileControllerService.createDirectory({ path: newFolderFullPath })
          .then(updateFolder)
          .catch((err) => {
            toast.error(`Failed to create folder, error: ${err}`);
          });
      }
    },
    [folderPath],
  );

  return (
    <div className="story-wrapper" style={style}>
      {error}
      <FileBrowser
        files={files}
        folderChain={folderChain}
        onFileAction={handleFileAction}
        fileActions={[ChonkyActions.CreateFolder]}
      >
        <FileNavbar />
        <FileToolbar />
        <FileList />
      </FileBrowser>
    </div>
  );
}

BackendFileViewer.defaultProps = {
  handleFileSelected: () => {},
  style: () => {},
};

export default BackendFileViewer;
