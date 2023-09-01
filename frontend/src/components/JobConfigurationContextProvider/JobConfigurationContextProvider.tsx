import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  ParameterTreeBeamline,
  ParameterTreeService,
  ParameterTreeStructure,
  ParameterTreeStructureBranch,
  ParameterTreeStructureBranchMutable,
} from '../../network';
import ParameterTreeDataBase from '../../classes/parameterTreeData/parameterTreeDataBase';
import ParameterTreeDataBranch from '../../classes/parameterTreeData/parameterTreeDataBranch';
import {
  getDefaultParameterTreeDataFromStructure,
  getDefaultParameterTreeDataFromStructureNode,
} from '../../util/paramTreeUtil';
import { ParameterTreeStructureBaseModel } from '../../network/models/ParameterTreeStructureBaseModel';
import ParameterTreeDataLeaf from '../../classes/parameterTreeData/parameterTreeDataLeaf';

export type JobConfigurationContextType = {
  parameterTreeData: ParameterTreeDataBranch | undefined,
  parameterTreeStructures: ParameterTreeStructure[],
  selectedBeamlineId: string | undefined,
  extraOptions: Record<string, any>,
  outputFolder: string,
  selectedParameterTreeStructure: ParameterTreeBeamline | undefined,
  selectedParamIdPath: string[],
  onParameterAdd: (addToId: string, nameParam?: string, typeKeyParam?: string) => void,
  onParameterRename: (renameId: string, newName: string) => void,
  onParameterTypeChange: (changeId: string, newType: string) => void,
  setSelectedParameterValue: (idPath: string[], value: any) => void,
  setSelectedBeamlineId: (beamlineId: string) => void,
  setParameterTreeData: (parameterTreeData: ParameterTreeDataBranch) => void,
  setExtraOptions: (extraOptions: Record<string, any>) => void,
  setOutputFolder: (outputFolder: string) => void,
  setSelectedParamIdPath: (selectedParamIdPath: string[]) => void,
};

export const JobConfigurationContext = createContext<JobConfigurationContextType>({
  parameterTreeData: undefined,
  parameterTreeStructures: [],
  selectedBeamlineId: undefined,
  extraOptions: {},
  outputFolder: '',
  selectedParameterTreeStructure: undefined,
  selectedParamIdPath: [],
  onParameterAdd: () => {
  },
  onParameterRename: () => {
  },
  onParameterTypeChange: () => {
  },
  setSelectedParameterValue: () => {
  },
  setSelectedBeamlineId: () => {
  },
  setParameterTreeData: () => {
  },
  setExtraOptions: () => {
  },
  setOutputFolder: () => {
  },
  setSelectedParamIdPath: () => {
  },
});

type Props = {
  children: React.ReactNode
};

function JobConfigurationContextProvider({ children: childrenComponents }: Props) {
  const [
    parameterTreeData,
    setParameterTreeData,
  ] = useState<ParameterTreeDataBranch | undefined>(undefined);

  const [
    parameterTreeStructures,
    setParameterTreeStructures,
  ] = useState<ParameterTreeStructure[]>([]);

  const [
    selectedBeamlineId,
    setSelectedBeamlineId,
  ] = useState<string | undefined>(undefined);

  const [extraOptions, setExtraOptions] = useState<Record<string, any>>({});
  const [outputFolder, setOutputFolder] = useState<string>('');
  const [selectedParamIdPath, setSelectedParamIdPath] = React.useState<string[]>([]);

  const selectedParameterTreeStructure = useMemo<ParameterTreeBeamline | undefined>(() => {
    if (!selectedBeamlineId) {
      return undefined;
    }

    const findBeamline = (
      paramTree: ParameterTreeStructure,
      selectedParamTreeName: string,
    ) => paramTree.beamlines.find(({ id }) => id === selectedParamTreeName);

    const selectedBeamline = parameterTreeStructures.map(
      (paramTree) => findBeamline(paramTree, selectedBeamlineId),
    ).find((beamline) => beamline);

    return selectedBeamline || undefined;
  }, [parameterTreeStructures, selectedBeamlineId]);

  const addParameter = (addToId: string, nameParam?: string, typeKeyParam?: string) => {
    const traverse = (childParamTreeData: ParameterTreeDataBase): ParameterTreeDataBase => {
      if (childParamTreeData instanceof ParameterTreeDataBranch) {
        const children = childParamTreeData.children.map((child) => traverse(child));

        if (childParamTreeData.id === addToId) {
          if (childParamTreeData.structure.type === 'ParameterTreeStructureBranchMutable') {
            const currentNodeStructure = childParamTreeData.structure as
              ParameterTreeStructureBranchMutable;

            // Creating the name for the new parameter (if not provided)
            let nameToUse = nameParam;
            let counter = 0;
            if (!nameToUse) { // Name will be default_name_0, default_name_1, etc.
              nameToUse = `${currentNodeStructure.default_name}_${counter}`;
              // eslint-disable-next-line @typescript-eslint/no-loop-func
              while (children.some((otherChild) => otherChild.name === nameToUse)) {
                nameToUse = `${currentNodeStructure.default_name}_${counter}`;
                counter += 1;
              }
            }

            // Checking if the name is already used
            if (children.some((otherChild) => otherChild.name === nameToUse)) {
              toast.error("Can't add parameter with same name");
            } else {
              // We're all good, we can add the parameter
              const typeKey = typeKeyParam ?? currentNodeStructure.default_key;

              const newNodeStructure = currentNodeStructure.value[typeKey];
              const newNode = getDefaultParameterTreeDataFromStructureNode(
                newNodeStructure,
                nameToUse,
                childParamTreeData.idPath,
              );

              newNode.mutableStructureType = typeKey;
              children.push(newNode);
            }
          } else {
            console.error('Structure data mismatch');
          }
        }

        return new ParameterTreeDataBranch(
          childParamTreeData.id,
          childParamTreeData.idPath,
          childParamTreeData.name,
          childParamTreeData.structure,
          children,
          childParamTreeData.mutableStructureType,
        );
      }

      return childParamTreeData;
    };

    if (parameterTreeData) {
      const newParameterTreeData = traverse(parameterTreeData) as ParameterTreeDataBranch;
      setParameterTreeData(newParameterTreeData);
    }
  };

  const renameParameter = (renameId: string, newName: string) => {
    const traverse = (
      childParamTreeData: ParameterTreeDataBase,
      parentData: ParameterTreeDataBranch | undefined,
    ): ParameterTreeDataBase => {
      if (childParamTreeData instanceof ParameterTreeDataBranch) {
        let currentNewName = childParamTreeData.name;
        // Getting the current children, we will replace discard them in a few lines if
        // we have not found the renameId yet
        let { children } = childParamTreeData;
        if (childParamTreeData.id === renameId) {
          if (childParamTreeData.name === newName) {
            // Nothing to do, the name is already the same
            return childParamTreeData;
          }

          // Checking if the name is already used
          if (parentData) {
            if (parentData.children.some((otherChild) => otherChild.name === newName)) {
              toast.error('A parameter with the same name already exists');
              return childParamTreeData;
            }
          }

          // We're all good, we can rename the parameter
          currentNewName = newName;
        } else { // This is a branch, but not the one we're looking for - traverse its children
          // eslint-disable-next-line arrow-body-style
          children = childParamTreeData.children.map((child) => {
            return traverse(child, childParamTreeData);
          });
        }
        return new ParameterTreeDataBranch(
          childParamTreeData.id,
          childParamTreeData.idPath,
          currentNewName,
          childParamTreeData.structure,
          children,
          childParamTreeData.mutableStructureType,
        );
      }

      return childParamTreeData;
    };

    if (parameterTreeData) {
      const newParameterTreeData = traverse(
        parameterTreeData,
        undefined,
      ) as ParameterTreeDataBranch;
      setParameterTreeData(newParameterTreeData);
    }
  };

  const changeParameterType = (changeId: string, newType: string) => {
    const traverse = (
      childParamTreeData: ParameterTreeDataBase,
      parentStructure: ParameterTreeStructureBaseModel | undefined,
    ): ParameterTreeDataBase => {
      if (childParamTreeData instanceof ParameterTreeDataBranch) {
        const currentNewType = childParamTreeData.mutableStructureType;
        if (childParamTreeData.id === changeId) {
          if (
            childParamTreeData.structure.type === 'ParameterTreeStructureBranchMutable'
            && !(childParamTreeData.structure as ParameterTreeStructureBranchMutable).allow_multiple
          ) {
            // In the case of a single child, we skip out having a wrapper around it and just
            // put the children directly in ParameterTreeStructureBranchMutable, this is handling
            // this case

            // eslint-disable-next-line max-len
            const mutableStructure = childParamTreeData.structure as ParameterTreeStructureBranchMutable;
            const newStructure = mutableStructure.value[newType] as ParameterTreeStructureBranch;
            const children = Object.entries(newStructure.value)
              .map((
                [childName, child],
              ) => getDefaultParameterTreeDataFromStructureNode(
                child,
                childName,
                childParamTreeData.idPath,
              ));

            return new ParameterTreeDataBranch(
              childParamTreeData.id,
              childParamTreeData.idPath,
              childParamTreeData.name,
              childParamTreeData.structure,
              children,
              newType,
            );
          }
          if (parentStructure?.type === 'ParameterTreeStructureBranchMutable') {
            // In this case, we're changing the type of a child of a
            // ParameterTreeStructureBranchMutable, so we can just change ourselves to the new type
            const parentStructureMutable = parentStructure as ParameterTreeStructureBranchMutable;
            const newStructure = parentStructureMutable.value[newType];
            const newNode = getDefaultParameterTreeDataFromStructureNode(
              newStructure,
              childParamTreeData.name,
              childParamTreeData.idPath,
            );

            newNode.mutableStructureType = newType;
            return newNode;
          }
          throw new Error(`Structure data mismatch, can't change of ID ${changeId}`);
        }

        // Traverse all children of this data branch to search for node to change
        const children: ParameterTreeDataBase[] = childParamTreeData.children.map(
          (child) => traverse(child, childParamTreeData.structure),
        );

        return new ParameterTreeDataBranch(
          childParamTreeData.id,
          childParamTreeData.idPath,
          childParamTreeData.name,
          childParamTreeData.structure,
          children,
          currentNewType,
        );
      }

      return childParamTreeData;
    };

    if (parameterTreeData) {
      const newParameterTreeData = traverse(
        parameterTreeData,
        undefined,
      ) as ParameterTreeDataBranch;
      setParameterTreeData(newParameterTreeData);
    }
  };

  const setSelectedParameterValue = (idPath: string[], value: any) => {
    const traverse = (
      childParamTreeData: ParameterTreeDataBase,
      remainingPath: string[],
    ): ParameterTreeDataBase => {
      if (childParamTreeData instanceof ParameterTreeDataBranch) {
        if (remainingPath.length === 0) {
          return childParamTreeData;
        }
        const [nextId, ...nextRemainingPath] = remainingPath;
        const child = childParamTreeData.children.find((c) => c.id === nextId);
        if (!child) {
          throw new Error(`Could not find child with ID ${nextId}`);
        }
        const newChild = traverse(child, nextRemainingPath);
        const newChildren = childParamTreeData.children.map((c) => {
          if (c.id === nextId) {
            return newChild;
          }
          return c;
        });

        return new ParameterTreeDataBranch(
          childParamTreeData.id,
          childParamTreeData.idPath,
          childParamTreeData.name,
          childParamTreeData.structure,
          newChildren,
          childParamTreeData.mutableStructureType,
        );
      }

      if (childParamTreeData instanceof ParameterTreeDataLeaf) {
        if (remainingPath.length !== 0) {
          throw new Error(`Unexpected remaining path ${remainingPath.join('.')}`);
        }
        return new ParameterTreeDataLeaf(
          childParamTreeData.id,
          childParamTreeData.idPath,
          childParamTreeData.name,
          childParamTreeData.structure,
          value,
        );
      }

      throw new Error(`Unexpected childParamTreeData type ${childParamTreeData}`);
    };

    if (parameterTreeData) {
      const newParameterTreeData = traverse(
        parameterTreeData,
        idPath.slice(1),
      ) as ParameterTreeDataBranch;
      setParameterTreeData(newParameterTreeData);
    }
  };

  const contextValue = useMemo<JobConfigurationContextType>(() => ({
    parameterTreeData,
    parameterTreeStructures,
    selectedBeamlineId,
    extraOptions,
    outputFolder,
    selectedParameterTreeStructure,
    selectedParamIdPath,
    onParameterAdd: addParameter,
    onParameterTypeChange: changeParameterType,
    onParameterRename: renameParameter,
    setSelectedParameterValue,
    setSelectedBeamlineId,
    setParameterTreeData,
    setExtraOptions,
    setOutputFolder,
    setSelectedParamIdPath,
  }), [
    parameterTreeData, parameterTreeStructures, selectedBeamlineId,
    extraOptions, outputFolder, selectedParameterTreeStructure, selectedParamIdPath,
    addParameter, changeParameterType, renameParameter, setSelectedParameterValue,
    setSelectedBeamlineId, setParameterTreeData, setExtraOptions, setOutputFolder,
    setSelectedParamIdPath,
  ]);

  useEffect(() => {
    ParameterTreeService.getParameterTrees()
      .then((response) => {
        setParameterTreeStructures(response);
        if (response.length !== 0) {
          if (response[0].beamlines.length !== 0) {
            setSelectedBeamlineId(response[0].beamlines[0].id);
          }
        }
      });
  }, []);

  useEffect(() => {
    // Whenever the selected parameter tree structure changes,
    // we need to update all the data
    if (!selectedParameterTreeStructure) {
      setParameterTreeData(undefined);
      return;
    }

    setOutputFolder(selectedParameterTreeStructure.default_output_folder);
    const defaultParameterTreeData = getDefaultParameterTreeDataFromStructure(
      selectedParameterTreeStructure,
    );
    setParameterTreeData(defaultParameterTreeData);

    // Updating the extra options array with the default values
    const newExtraOptions: Record<string, any> = selectedParameterTreeStructure.extra_options
      .reduce((acc: Record<string, any>, extraOption) => {
        acc[extraOption.config_name] = extraOption.default_value;
        return acc;
      }, {});

    setExtraOptions(newExtraOptions);
  }, [selectedParameterTreeStructure]);

  return (
    <JobConfigurationContext.Provider value={contextValue}>
      {childrenComponents}
    </JobConfigurationContext.Provider>
  );
}

export default JobConfigurationContextProvider;
