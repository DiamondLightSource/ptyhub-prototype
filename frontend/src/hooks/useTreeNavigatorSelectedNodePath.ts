import { useMemo } from 'react';
import { Tree } from '../types/tree';

// Finds the path to the selected node in the tree
// eslint-disable-next-line max-len
const useTreeNavigatorSelectedNodePath = (tree: Tree, selectedIdPath: string[]): Tree[] => useMemo<Tree[]>(() => {
  // Function to traverse the tree and find the selected node path
  const findSelectedNodePath = (remainingTree: Tree, remainingSelectedIdPath: string[]): Tree[] => {
    if (remainingTree.id === remainingSelectedIdPath[0]) {
      if (remainingSelectedIdPath.length === 1) {
        return [remainingTree];
      }

      const [, ...childrenRemainingSelectedIdPath] = remainingSelectedIdPath;

      // eslint-disable-next-line
      const foundChild = remainingTree.children.find((child) => {
        return child.id === childrenRemainingSelectedIdPath[0];
      });

      if (foundChild) {
        return [
          remainingTree,
          ...findSelectedNodePath(foundChild, childrenRemainingSelectedIdPath),
        ];
      }
    }

    return [];
  };

  return findSelectedNodePath(tree, selectedIdPath);
}, [tree, selectedIdPath]);

export default useTreeNavigatorSelectedNodePath;
