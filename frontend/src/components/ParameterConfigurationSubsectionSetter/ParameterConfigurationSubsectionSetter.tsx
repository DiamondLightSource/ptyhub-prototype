import React from 'react';
import ReactMarkdown from 'react-markdown';
import TreeNavigatorLinkPath from '../TreeNavigatorLinkPath/TreeNavigatorLinkPath';
import { Tree } from '../../types/tree';
import './ParameterConfigurationSubsectionSetter.css';
import ParameterTreeDataBase from '../../classes/parameterTreeData/parameterTreeDataBase';
import useTreeDataSelectedNode from '../../hooks/useTreeDataSelectedNode';
import { ParameterTreeStructureLeaf } from '../../network';
import ParameterTreeDataLeaf from '../../classes/parameterTreeData/parameterTreeDataLeaf';
import ParameterConfigurationSubsectionSetterInput
  from '../ParameterConfigurationSubsectionSetterInput/ParameterConfigurationSubsectionSetterInput';

type Props = {
  tree: Tree
  treeData?: ParameterTreeDataBase
  selectedParamIdPath: string[]
  onParamSelect: (id: string[]) => void
  onParamValueChange: (value: any) => void
};

function ParameterConfigurationSubsectionSetter({
  tree,
  treeData,
  selectedParamIdPath,
  onParamSelect,
  onParamValueChange,
}: Props) {
  const selectedData = useTreeDataSelectedNode(treeData, selectedParamIdPath);

  return (
    <div className="parameter-configuration-subsection-setter">
      <TreeNavigatorLinkPath
        tree={tree}
        selectedIdPath={selectedParamIdPath}
        onParamSelect={onParamSelect}
      />

      {selectedData && (
        <>
          <div className="parameter-configuration-subsection-setter__title-value-wrapper">
            <h4 className="parameter-configuration-subsection-setter__title-value-wrapper__title">
              {selectedData.name}
            </h4>

            {selectedData instanceof ParameterTreeDataLeaf && (
              <ParameterConfigurationSubsectionSetterInput
                parameter={selectedData}
                onParameterValueChanged={onParamValueChange}
              />
            )}
          </div>

          {selectedData.structure.type === 'ParameterTreeStructureLeaf' && (
            <>
              <ReactMarkdown className="parameter-configuration-subsection-setter__markup">
                {(selectedData.structure as ParameterTreeStructureLeaf).description_short}
              </ReactMarkdown>

              <ReactMarkdown className="parameter-configuration-subsection-setter__markup">
                {(selectedData.structure as ParameterTreeStructureLeaf).description_long}
              </ReactMarkdown>
            </>
          )}
        </>
      )}
    </div>
  );
}

ParameterConfigurationSubsectionSetter.defaultProps = {
  treeData: undefined,
};

export default ParameterConfigurationSubsectionSetter;
