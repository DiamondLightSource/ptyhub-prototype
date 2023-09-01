import React, { useEffect } from 'react';
import { Tree } from '../../types/tree';
import TreeNavigatorBranch from '../TreeNavigatorBranch/TreeNavigatorBranch';
import './TreeNavigator.css';
import CustomTextInput from '../CustomTextInput/CustomTextInput';
import useTreeNavigatorSelectedNodePath from '../../hooks/useTreeNavigatorSelectedNodePath';

type Props = {
  tree: Tree
  selectedIdPath: string[]
  onSelect: (selectedIdPath: string[]) => void
  expandFully?: boolean
  disablePathInput?: boolean
  onAdd?: (addToId: string) => void
  onNameEdit?: (id: string, newName: string) => void
  onTypeChange?: (id: string, newType: string) => void,
};

function TreeNavigator({
  tree,
  selectedIdPath,
  onSelect,
  expandFully,
  disablePathInput,
  onAdd,
  onNameEdit,
  onTypeChange,
}: Props) {
  const [pathInput, setPathInput] = React.useState('');
  const [pathInputValid, setPathInputValid] = React.useState(true);
  const selectedPath: Tree[] = useTreeNavigatorSelectedNodePath(tree, selectedIdPath);

  useEffect(() => {
    setPathInput(selectedPath.map((node) => node.name).join('/'));
  }, [selectedPath]);

  const handlePathInput = (input: string) => {
    setPathInput(input);

    // Finding the node with the given path
    const pathParts = input.split('/')
      .filter((p) => p !== '');

    const traverse = (
      node: Tree,
      remainingPathParts: string[],
      parentNodeIdPath: string[],
    ): string[] | undefined => {
      const nodeIdPath = [...parentNodeIdPath, node.id];
      if (node.name === remainingPathParts[0]) {
        // eslint-disable-next-line
        const child = node.children.find((searchChild) => {
          return searchChild.name === remainingPathParts[1];
        });

        if (child) {
          return traverse(child, remainingPathParts.slice(1), nodeIdPath);
        }

        if (remainingPathParts.length === 1) {
          return nodeIdPath;
        }
      }

      return undefined;
    };

    const selectedNodeIdPath = traverse(tree, pathParts, []);
    setPathInputValid(selectedNodeIdPath !== undefined);
    if (selectedNodeIdPath !== undefined) {
      const doesInputtedPathEqualSelectedPath = selectedNodeIdPath.join('') === selectedIdPath.join('');
      if (!doesInputtedPathEqualSelectedPath) {
        // We don't want to call onSelect if the path has not changed
        onSelect(selectedNodeIdPath);
      }
    }
  };

  return (
    <div className="tree-navigator">
      {!disablePathInput && (
        <CustomTextInput
          type="text"
          placeholder="Path"
          value={pathInput}
          className={`tree-navigator__path-input${pathInputValid ? '' : ' tree-navigator__path-input--invalid'}`}
          onChange={handlePathInput}
        />
      )}

      <TreeNavigatorBranch
        subtree={tree}
        parentIdPath={[]}
        selectedIdPath={selectedIdPath}
        onSelect={onSelect}
        expandedByDefault={expandFully}
        onAdd={onAdd}
        onNameEdit={onNameEdit}
        isNameEditable={tree.areChildrenMutable}
        onTypeChange={onTypeChange}
        alwaysShowArrow
      />
    </div>
  );
}

TreeNavigator.defaultProps = {
  disablePathInput: false,
  expandFully: false,
  onAdd: () => {},
  onNameEdit: () => {},
  onTypeChange: () => {},
};

export default TreeNavigator;
