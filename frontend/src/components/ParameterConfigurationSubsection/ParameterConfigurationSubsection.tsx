import React, { useContext, useMemo, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import CustomPanelResizeHandle from '../CustomPanelResizeHandle/CustomPanelResizeHandle';
import Subsection from '../Subsection/Subsection';
import ParameterConfigurationSubsectionSetter
  from '../ParameterConfigurationSubsectionSetter/ParameterConfigurationSubsectionSetter';
import PanelOverflowable from '../PanelOverflowable/PanelOverflowable';
import ParameterConfigurationSubsectionSearchParameterTree
  from '../ParameterConfigurationSubsectionSearchParameterTree/ParameterConfigurationSubsectionSearchParameterTree';
import TreeNavigator from '../TreeNavigator/TreeNavigator';
import useParamTreeToTree from '../../hooks/useParamTreeToTree';
import SubsectionTitle from '../SubsectionTitle/SubsectionTitle';
import Seperator, { SeperatorOrientation } from '../Seperator/Seperator';
import './ParameterConfigurationSubsection.css';
import {
  convertParameterTreeDataToJson,
  convertParameterTreeDataToYaml,
  loadParameterTreeFromFile,
} from '../../util/paramTreeUtil';
import CustomTextInput from '../CustomTextInput/CustomTextInput';
import CustomButton from '../CustomButton/CustomButton';
import download from '../../util/download';
import { ParameterTreeStructure } from '../../network';
import BackendParameterTreeFileModalOpener
  from '../BackendParameterTreeFileModalOpener/BackendParameterTreeFileModalOpener';
import { AppInfoContext } from '../AppInfoContextProvider/AppInfoContextProvider';
import {
  JobConfigurationContext,
  JobConfigurationContextType,
} from '../JobConfigurationContextProvider/JobConfigurationContextProvider';

function ParameterConfigurationSubsection() {
  const [configFileName, setConfigFileName] = useState<string>('');
  const [userLevel, setUserLevel] = useState<number>(1);

  const {
    parameterTreeData,
    parameterTreeStructures,
    selectedBeamlineId,
    extraOptions,
    selectedParameterTreeStructure,
    selectedParamIdPath,
    onParameterAdd,
    onParameterTypeChange,
    onParameterRename,
    setSelectedParameterValue,
    setSelectedBeamlineId,
    setParameterTreeData,
    setExtraOptions,
    setSelectedParamIdPath,
  } = useContext<JobConfigurationContextType>(JobConfigurationContext);

  const {
    isDeploymentMode,
  } = useContext(AppInfoContext);

  const handleConfigFileChange = (files: File[]) => {
    if (files.length !== 1) {
      throw new Error(`Number of config files selected is not 1, value: ${files.length}`);
    }

    const file = files[0];
    setConfigFileName(file.name);

    loadParameterTreeFromFile(
      file,
      selectedParameterTreeStructure,
      setSelectedParamIdPath,
      setExtraOptions,
      setParameterTreeData,
    );
  };

  const handleParameterTreeChange = (newParameterTreeName: string) => {
    // Finding first beamline id in the newly selected parameter tree
    const newParameterTree = parameterTreeStructures.find(
      (paramTree) => paramTree.name === newParameterTreeName,
    );

    if (newParameterTree && newParameterTree.beamlines.length !== 0) {
      setSelectedBeamlineId(newParameterTree.beamlines[0].id);
    }
  };

  const selectedParameterTree = useMemo<ParameterTreeStructure | undefined>(() => {
    let result: ParameterTreeStructure | undefined;

    parameterTreeStructures.some((paramTree) => {
      const found = paramTree.beamlines.some(
        (beamline) => beamline.id === selectedBeamlineId,
      );

      if (found) {
        result = paramTree;
      }

      return found;
    });

    return result;
  }, [selectedBeamlineId, parameterTreeStructures]);

  const downloadParamTree = (isJson: boolean) => {
    if (parameterTreeData && selectedParameterTreeStructure) {
      // If no file name defined save in format YYYYMMDD_HHMMSS
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const second = now.getSeconds().toString().padStart(2, '0');
      const timestamp = `${year}${month}${day}_${hour}${minute}${second}`;

      // Use the provided configFileName if available,
      // otherwise generate a filename with the human-readable timestamp
      const configFileNameToUse = configFileName || `config_${timestamp}.${isJson ? 'json' : 'yaml'}`;

      const downloadData = isJson
        ? convertParameterTreeDataToJson(
          selectedParameterTreeStructure,
          parameterTreeData,
          extraOptions,
        ) : convertParameterTreeDataToYaml(
          selectedParameterTreeStructure,
          parameterTreeData,
          extraOptions,
        );
      download(downloadData, configFileNameToUse);
    }
  };

  const tree = useParamTreeToTree(parameterTreeData, userLevel);

  return (
    <Subsection style={{ flexDirection: 'column' }}>
      <div className="parameter-configuration-subsection__header">
        <div>
          {/* Left hand side */}
          <SubsectionTitle title="Parameters" />
          <Seperator orientation={SeperatorOrientation.VERTICAL} coloured />
          <CustomTextInput
            value={configFileName}
            type="text"
            placeholder="Config file"
            onChange={(value) => setConfigFileName(value)}
          />
          <Seperator orientation={SeperatorOrientation.VERTICAL} />

          {
            !isDeploymentMode && (
              <>
                <BackendParameterTreeFileModalOpener
                  parameterTreeData={parameterTreeData}
                  selectedParameterTreeStructure={selectedParameterTreeStructure}
                  extraOptions={extraOptions}
                  onConfigFileChange={handleConfigFileChange}
                />
                <Seperator orientation={SeperatorOrientation.VERTICAL} />
              </>
            )
          }

          <CustomButton
            text="Download YAML"
            onClick={() => downloadParamTree(false)}
          />
          <Seperator orientation={SeperatorOrientation.VERTICAL} />
          <CustomButton
            text="Download JSON"
            onClick={() => downloadParamTree(true)}
          />

        </div>

        <div>
          {/* Right hand side */}
          <select onChange={(e) => {
            setUserLevel(Number(e.currentTarget.value));
          }}
          >
            <option value="1">Basic</option>
            <option value="2">Advanced</option>
          </select>

          {
            !isDeploymentMode && (
              <>
                <select
                  value={selectedParameterTree?.name}
                  onChange={(e) => handleParameterTreeChange(e.target.value)}
                >
                  {
                    parameterTreeStructures.map((structure) => (
                      <option
                        key={structure.name}
                        value={structure.name}
                      >
                        {structure.name}
                      </option>
                    ))
                  }
                </select>

                <select
                  value={selectedBeamlineId}
                  onChange={(e) => setSelectedBeamlineId(e.target.value)}
                >
                  {
                    selectedParameterTree?.beamlines.map((beamline) => (
                      <option
                        key={beamline.name}
                        value={beamline.id}
                      >
                        {beamline.name}
                      </option>
                    ))
                  }
                </select>
              </>
            )
          }
        </div>
      </div>

      <br />

      {
        tree && (
          <div className="parameter-configuration-subsection__content">
            <PanelGroup direction="horizontal" style={{ height: '500px' }}>
              <PanelOverflowable overflowDirection="both" defaultSize={25} minSize={15}>
                <TreeNavigator
                  tree={tree}
                  selectedIdPath={selectedParamIdPath}
                  onSelect={setSelectedParamIdPath}
                  onAdd={onParameterAdd}
                  onNameEdit={onParameterRename}
                  onTypeChange={onParameterTypeChange}
                />
              </PanelOverflowable>
              <CustomPanelResizeHandle direction="vertical" />
              <Panel defaultSize={50} minSize={30}>
                <PanelGroup direction="vertical">
                  <PanelOverflowable overflowDirection="both" defaultSize={50} minSize={25}>
                    <ParameterConfigurationSubsectionSetter
                      tree={tree}
                      treeData={parameterTreeData}
                      selectedParamIdPath={selectedParamIdPath}
                      onParamSelect={setSelectedParamIdPath}
                      onParamValueChange={(newValue: any) => setSelectedParameterValue(
                        selectedParamIdPath,
                        newValue,
                      )}
                    />
                  </PanelOverflowable>

                  <CustomPanelResizeHandle direction="horizontal" />

                  <PanelOverflowable overflowDirection="both" defaultSize={50} minSize={25}>
                    <ParameterConfigurationSubsectionSearchParameterTree
                      tree={tree}
                      selectedParamIdPath={selectedParamIdPath}
                      onParamSelect={setSelectedParamIdPath}
                    />
                  </PanelOverflowable>
                </PanelGroup>
              </Panel>
              <CustomPanelResizeHandle direction="vertical" />
              <Panel defaultSize={25} minSize={20}>
                Preview
              </Panel>
            </PanelGroup>
          </div>
        )
      }
    </Subsection>
  );
}

export default ParameterConfigurationSubsection;
