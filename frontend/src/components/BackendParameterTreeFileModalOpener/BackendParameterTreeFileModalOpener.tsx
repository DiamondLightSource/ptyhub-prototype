import React, { useState } from 'react';
import { toast } from 'react-toastify';
import BackendFileViewerModal from '../BackendFileViewerModal/BackendFileViewerModal';
import CustomButton from '../CustomButton/CustomButton';
import Seperator, { SeperatorOrientation } from '../Seperator/Seperator';
import { ParameterTreeBeamline } from '../../network/models/ParameterTreeBeamline';
import ParameterTreeDataBranch from '../../classes/parameterTreeData/parameterTreeDataBranch';
import { convertParameterTreeDataToJson, convertParameterTreeDataToYaml } from '../../util/paramTreeUtil';
import { FileControllerService } from '../../network/services/FileControllerService';

type Props = {
  selectedParameterTreeStructure: ParameterTreeBeamline | undefined,
  parameterTreeData: ParameterTreeDataBranch | undefined,
  extraOptions: Record<string, any>,
  onConfigFileChange: (files: File[]) => void
};

function BackendParameterTreeFileModalOpener({
  selectedParameterTreeStructure,
  parameterTreeData,
  extraOptions,
  onConfigFileChange,
}: Props) {
  const [folderPath, setFolderPath] = useState<string>('/');
  const [loadIsOpen, setLoadIsOpen] = useState<boolean>(false);
  const [saveIsOpen, setSaveIsOpen] = useState<boolean>(false);

  const handleSave = (filePath: string) => {
    if (!selectedParameterTreeStructure || !parameterTreeData) {
      toast.error('Unable to save as the parameter tree has not loaded yet');
      return;
    }

    const isJson = filePath.toLowerCase().endsWith('.json');

    const writeData = isJson
      ? convertParameterTreeDataToJson(
        selectedParameterTreeStructure,
        parameterTreeData,
        extraOptions,
      ) : convertParameterTreeDataToYaml(
        selectedParameterTreeStructure,
        parameterTreeData,
        extraOptions,
      );

    FileControllerService.writeToFile({
      path: filePath,
      content: writeData,
    }).then((result) => {
      if (result.success) {
        toast.success('File saved successfully');
      } else {
        throw Error('Unknown error');
      }
    }).catch((err) => {
      toast.error(`Failed to save file, error: ${err}`);
    });
  };

  const handleLoad = (path: string) => {
    FileControllerService.readFile(path).then((res) => {
      const fileNameSplit = res.path.split('/');
      const fileName = fileNameSplit[fileNameSplit.length - 1];
      const file = new File([res.content], fileName);
      onConfigFileChange([file]);
      toast.success('Loaded file successfully');
    }).catch((err) => {
      toast.error(`Failed to read file, error: ${err}`);
    });
  };

  return (
    <>
      <CustomButton text="Load" onClick={() => { setLoadIsOpen(true); }} />
      <BackendFileViewerModal
        folderPath={folderPath}
        isSaveFile={false}
        isFolderSelector={false}
        handleFolderChange={(newPath) => setFolderPath(newPath)}
        isOpen={loadIsOpen}
        handleClose={() => setLoadIsOpen(false)}
        handleDirectoryEntrySelected={handleLoad}
      />

      <Seperator orientation={SeperatorOrientation.VERTICAL} />

      <CustomButton text="Save" onClick={() => { setSaveIsOpen(true); }} />
      <BackendFileViewerModal
        folderPath={folderPath}
        isSaveFile
        filesTypes={['.json', '.yaml']}
        isFolderSelector={false}
        handleFolderChange={(newPath) => setFolderPath(newPath)}
        isOpen={saveIsOpen}
        handleClose={() => setSaveIsOpen(false)}
        handleDirectoryEntrySelected={(newFile) => handleSave(newFile)}
      />
    </>
  );
}

export default BackendParameterTreeFileModalOpener;
