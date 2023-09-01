import { useMemo } from 'react';
import { ParameterTreeStructureBranchMutable, ParameterTreeStructureLeaf } from '../network';
import { Tree } from '../types/tree';
import ParameterTreeDataBase from '../classes/parameterTreeData/parameterTreeDataBase';
import ParameterTreeDataBranch from '../classes/parameterTreeData/parameterTreeDataBranch';
import ParameterTreeDataLeaf from '../classes/parameterTreeData/parameterTreeDataLeaf';

const convertParamTreeToTree = (
  paramTreeData: ParameterTreeDataBase,
  userLevel: number,
  parentMutableBranchStructure?: ParameterTreeStructureBranchMutable,
): Tree | null => {
  const paramTreeStructure = paramTreeData.structure;
  const children: Tree[] = [];
  let areChildrenMutable = false;
  let allowAddChildren = false;

  if (paramTreeData.name === 'data') {
    // eslint-disable-next-line no-debugger
    // debugger;
  }

  if (paramTreeData instanceof ParameterTreeDataBranch) {
    let currentMutableBranchStructure: ParameterTreeStructureBranchMutable | undefined;
    if (paramTreeStructure.type === 'ParameterTreeStructureBranchMutable') {
      const branchStructure = paramTreeStructure as ParameterTreeStructureBranchMutable;
      areChildrenMutable = true;
      allowAddChildren = branchStructure.allow_multiple;
      currentMutableBranchStructure = branchStructure;

      if (!allowAddChildren) {
        // eslint-disable-next-line no-param-reassign
        parentMutableBranchStructure = branchStructure;
      }
    }

    paramTreeData.children.forEach((child) => {
      const convertedChild = convertParamTreeToTree(
        child,
        userLevel,
        currentMutableBranchStructure,
      );
      if (convertedChild) {
        children.push(convertedChild);
      }
    });

    if (children.length === 0) {
      return null;
    }
  }

  if (paramTreeData instanceof ParameterTreeDataLeaf) {
    const leafStructure = paramTreeStructure as ParameterTreeStructureLeaf;
    if (leafStructure.user_level > userLevel) {
      return null;
    }
  }

  return {
    id: paramTreeData.id,
    name: paramTreeData.name,
    children,
    areChildrenMutable,
    allowAddChildren,
    preventClick: false,
    parentMutableBranchStructure,
    mutableType: paramTreeData.mutableStructureType,
  };
};

// eslint-disable-next-line
const useParamTreeToTree = (
  paramTreeData: ParameterTreeDataBranch | undefined,
  userLevel: number,
): Tree | undefined => useMemo(() => {
  if (!paramTreeData) {
    return undefined;
  }

  const tree = convertParamTreeToTree(paramTreeData, userLevel);
  if (!tree) {
    return undefined;
  }

  return tree;
}, [paramTreeData, userLevel]);

export default useParamTreeToTree;
