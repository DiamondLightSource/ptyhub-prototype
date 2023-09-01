import { useMemo } from 'react';
import ParameterTreeDataBase from '../classes/parameterTreeData/parameterTreeDataBase';
import ParameterTreeDataBranch from '../classes/parameterTreeData/parameterTreeDataBranch';

const useTreeDataSelectedNode = (
  treeData: ParameterTreeDataBase | undefined,
  selectedNodeIdPath: string[],
): ParameterTreeDataBase | undefined => useMemo(() => {
  if (!treeData) {
    return undefined;
  }

  const findSelectedNode = (
    remainingTree: ParameterTreeDataBase,
    remainingSelectedIdPath: string[],
  ): ParameterTreeDataBase | undefined => {
    if (remainingTree.id === remainingSelectedIdPath[0]) {
      if (remainingSelectedIdPath.length === 1) {
        return remainingTree;
      }

      if (remainingTree instanceof ParameterTreeDataBranch) {
        const [, ...childrenRemainingSelectedIdPath] = remainingSelectedIdPath;
        // eslint-disable-next-line arrow-body-style
        const foundChild = remainingTree.children.find((child) => {
          return child.id === childrenRemainingSelectedIdPath[0];
        });

        if (foundChild) {
          return findSelectedNode(foundChild, childrenRemainingSelectedIdPath);
        }
      }
    }

    return undefined;
  };

  return findSelectedNode(treeData, selectedNodeIdPath);
}, [treeData, selectedNodeIdPath]);

export default useTreeDataSelectedNode;
