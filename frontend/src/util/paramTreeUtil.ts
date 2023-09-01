import { parse, stringify } from 'yaml';
import { v4 as uuid4 } from 'uuid';
import { toast } from 'react-toastify';
import {
  ParameterTreeStructureBranch,
  ParameterTreeStructureBranchMutable,
  ParameterTreeStructureLeaf,
  Reference,
} from '../network';
import ParameterTreeDataBranch from '../classes/parameterTreeData/parameterTreeDataBranch';
import ParameterTreeDataLeaf from '../classes/parameterTreeData/parameterTreeDataLeaf';
import ParameterTreeDataBase from '../classes/parameterTreeData/parameterTreeDataBase';
import { ParameterTreeType } from '../network/models/ParameterTreeType';
import { ParameterTreeBeamline } from '../network/models/ParameterTreeBeamline';

type Branch = ParameterTreeStructureBranch | ParameterTreeStructureBranchMutable;
type NodePossibleTypes =
  Branch
  | ParameterTreeStructureLeaf
  | Reference;

const expandParamTreeStructureBranch = (
  paramTreeNode: NodePossibleTypes,
  paramTree: ParameterTreeBeamline,
): Branch => {
  if (paramTreeNode.type === 'Reference') {
    // We have a reference, so we need to replace it with the definition
    const ref = paramTreeNode as Reference;
    return paramTree.definitions[ref.$ref.replace('#/definitions/', '')];
  }

  if ([
    'ParameterTreeStructureBranch', 'ParameterTreeStructureBranchMutable',
  ].includes(paramTreeNode.type)) {
    const branch = paramTreeNode as Branch;

    // Expanding all children of ParameterTreeBranch (which are not a ParameterTreeLeaf)
    // and updating keys
    // If they are a ParameterTreeLeaf, the value is just inserted
    const newChildren = Object.fromEntries(
      Object.entries(branch.value)
        .map(([paramName, paramValue]) => {
          if (paramValue.type === 'ParameterTreeStructureLeaf') {
            return [paramName, paramValue];
          }
          return [paramName, expandParamTreeStructureBranch(paramValue, paramTree)];
        }),
    );

    return {
      ...branch,
      value: newChildren,
    };
  }

  throw new Error(`Unknown type: ${paramTreeNode.type}`);
};

export const expandParamTreeStructure = (
  paramTree: ParameterTreeBeamline,
): ParameterTreeBeamline => {
  // Expanding definitions, keeping pointers to the original definitions
  // This means that there can be definitions that point to other definitions
  Object.values(paramTree.definitions)
    .forEach((def) => {
      // Keys will be the same so will be replaced
      Object.assign(def, expandParamTreeStructureBranch(def, paramTree));
    });

  const rootBranchExpanded = expandParamTreeStructureBranch(paramTree.root, paramTree);
  return {
    ...paramTree,
    root: rootBranchExpanded,
  };
};

export const getDefaultParameterTreeDataFromStructureNode = (
  node: ParameterTreeStructureBranch
  | ParameterTreeStructureBranchMutable
  | ParameterTreeStructureLeaf
  | Reference,
  name: string,
  parentIdPath: string[],
  fileValue?: any,
): ParameterTreeDataBase => {
  const id = uuid4();
  const idPath = [...parentIdPath, id];

  if (node.type === 'Reference') {
    throw new Error('Reference should not be present in expanded param tree');
  }

  if (['ParameterTreeStructureBranch', 'ParameterTreeStructureBranchMutable'].includes(node.type)) {
    let children: ParameterTreeDataBase[] = [];

    if (node.type === 'ParameterTreeStructureBranch') {
      const branch = node as ParameterTreeStructureBranch;
      children = Object.entries(branch.value)
        .map(([childName, child]) => getDefaultParameterTreeDataFromStructureNode(
          child,
          childName,
          idPath,
          fileValue?.[childName],
        ));
    }

    if (node.type === 'ParameterTreeStructureBranchMutable') {
      const branch = node as ParameterTreeStructureBranchMutable;

      if (branch.allow_multiple) {
        if (fileValue) {
          if (typeof fileValue !== 'object' || Array.isArray(fileValue)) {
            throw new Error('Value should be an object');
          }

          children = Object.entries(fileValue)
            .map(([childName, childValue]: [string, any]) => {
              const childType: string = childValue?.name ?? (() => {
                throw new Error('Child should have a name');
              })();
              const childStructure = branch.value[childType];
              if (!childStructure) {
                throw new Error(`Unknown child: ${childName}`);
              }
              const childData = getDefaultParameterTreeDataFromStructureNode(
                childStructure,
                childName,
                idPath,
                childValue,
              );

              childData.mutableStructureType = childType;
              return childData;
            });

          return new ParameterTreeDataBranch(id, idPath, name, node, children);
        }
        // We have not had a file provided, so use the default child
        const defaultChild = getDefaultParameterTreeDataFromStructureNode(
          branch.value[branch.default_key],
          `${branch.default_name}_0`,
          idPath,
        );
        defaultChild.mutableStructureType = branch.default_key;
        children = [defaultChild];
        return new ParameterTreeDataBranch(id, idPath, name, node, children);
      }

      // When we don't allow multiple children (i.e. we have a single child)
      // we want to skip a level in the tree
      // We do this by making the children of the current node the children of the
      // current node's only child
      if (![
        'ParameterTreeStructureBranch',
        'ParameterTreeStructureBranchMutable',
      ].includes(branch.value[branch.default_key].type)) {
        throw new Error('Values of mutable object should be branches');
      }

      let defaultBranchType = branch.default_key;

      if (fileValue) {
        if (!fileValue.name) {
          throw new Error(`No name provided for mutable branch ${name}`);
        }
        defaultBranchType = fileValue.name;
      }

      const defaultBranch = branch.value[defaultBranchType] as ParameterTreeStructureBranch;

      children = Object.entries(defaultBranch.value)
        .map((
          [childName, child],
        ) => getDefaultParameterTreeDataFromStructureNode(
          child,
          childName,
          idPath,
          fileValue?.[childName],
        ));

      const dataBranch = new ParameterTreeDataBranch(id, idPath, name, node, children);
      dataBranch.mutableStructureType = defaultBranchType;
      return dataBranch;
    }

    return new ParameterTreeDataBranch(id, idPath, name, node, children);
  }

  if (node.type === 'ParameterTreeStructureLeaf') {
    const leaf = node as ParameterTreeStructureLeaf;

    if (fileValue !== undefined) {
      return new ParameterTreeDataLeaf(id, idPath, name, node, fileValue);
    }

    return new ParameterTreeDataLeaf(id, idPath, name, node, leaf.default);
  }

  throw new Error(`Unknown type: ${node.type}`);
};

export const getDefaultParameterTreeDataFromStructure = (
  paramTree: ParameterTreeBeamline,
  fileValue?: any,
): ParameterTreeDataBranch => {
  const expandedParamTree = expandParamTreeStructure(paramTree);
  const result = getDefaultParameterTreeDataFromStructureNode(
    expandedParamTree.root,
    'Parameter tree',
    [],
    fileValue,
  );

  if (!(result instanceof ParameterTreeDataBranch)) {
    throw new Error('Root should be a branch');
  }

  return result;
};

const getParameterTreeFileObject = (
  paramTreeStructure: ParameterTreeBeamline,
  paramTreeData: ParameterTreeDataBase,
  extraOptions: Record<string, any>,
) => {
  // Add the extra options to the config file and wrap parameter tree in parameter_tree
  // if configured to do so. Otherwise just save straight param tree
  if (paramTreeStructure.save_extra_options_to_config) {
    return {
      ...extraOptions,
      parameter_tree: paramTreeData.serializeObject(),
    };
  }

  return paramTreeData.serializeObject();
};

export const convertParameterTreeDataToYaml = (
  paramTreeStructure: ParameterTreeBeamline,
  paramTreeData: ParameterTreeDataBase,
  extraOptions: Record<string, any>,
): string => stringify(getParameterTreeFileObject(
  paramTreeStructure,
  paramTreeData,
  extraOptions,
), {
  simpleKeys: true,
});

export const convertParameterTreeDataToJson = (
  paramTreeStructure: ParameterTreeBeamline,
  paramTreeData: ParameterTreeDataBase,
  extraOptions: Record<string, any>,
): string => JSON.stringify(
  getParameterTreeFileObject(paramTreeStructure, paramTreeData, extraOptions),
  null,
  2,
);

type ParameterTreeFileData = {
  parameterTreeData: ParameterTreeDataBranch,
  extraOptions: Record<string, any>
};

export const getParameterTreeDataFromFile = (
  file: File,
  defaultParameterTreeStructure: ParameterTreeBeamline,
): Promise<ParameterTreeFileData> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target === null) {
      reject(new Error('No event target'));
      return;
    }

    let data;
    try {
      data = JSON.parse(event.target.result as string);
    } catch (e) {
      try {
        data = parse(event.target.result as string);
      } catch (e2) {
        reject(e2);
      }
    }

    if (defaultParameterTreeStructure.parameter_tree_type === ParameterTreeType.PTYPY) {
      const response: ParameterTreeFileData = {
        parameterTreeData: getDefaultParameterTreeDataFromStructure(
          defaultParameterTreeStructure,
          data.parameter_tree,
        ),
        extraOptions: {
          visit_path: data.visit_path,
        },
      };

      resolve(response);
    } else if (defaultParameterTreeStructure.parameter_tree_type === ParameterTreeType.PTYREX) {
      const response: ParameterTreeFileData = {
        parameterTreeData: getDefaultParameterTreeDataFromStructure(
          defaultParameterTreeStructure,
          data,
        ),
        extraOptions: {},
      };

      resolve(response);
    } else {
      throw new Error(`Trying to parse an unknown parameter tree type file: ${defaultParameterTreeStructure.parameter_tree_type}`);
    }
  };
  reader.readAsText(file);
});

/**
 * Load parameter tree data from a given file and updates the associated state values.
 *
 * This function reads parameter tree data from a file based on the provided
 * beamline tree structure, and updates relevant states like selected parameter ID path,
 * extra options, and parameter tree data.
 */
export const loadParameterTreeFromFile = (
  file: File,
  selectedParameterTreeStructure: ParameterTreeBeamline | undefined,
  setSelectedParamIdPath: (selectedParamIdPath: string[]) => void,
  setExtraOptions: (extraOptions: Record<string, any>) => void,
  setParameterTreeData: (parameterTreeData: ParameterTreeDataBranch) => void,
) => {
  if (selectedParameterTreeStructure) {
    getParameterTreeDataFromFile(
      file,
      selectedParameterTreeStructure,
    ).then((newParameterTreeData) => {
      setSelectedParamIdPath([]);
      setParameterTreeData(newParameterTreeData.parameterTreeData);

      if (selectedParameterTreeStructure.save_extra_options_to_config) {
        const newExtraOptions: Record<string, any> = {};
        // Update the extra options from the config file
        Object.entries(newParameterTreeData.extraOptions).forEach(([extraOptionKey]) => {
          if (!(extraOptionKey in newParameterTreeData.extraOptions)) {
            throw new Error(`Missing key ${extraOptionKey} in loaded config file`);
          }

          newExtraOptions[extraOptionKey] = newParameterTreeData.extraOptions[extraOptionKey];
        });

        setExtraOptions(newExtraOptions);
      }
    });
  } else {
    toast.error('We have not yet received the default parameter tree structure, please refresh the page');
  }
};
