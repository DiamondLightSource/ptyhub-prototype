import { useMemo } from 'react';
import { Tree } from '../types/tree';

// Finds the node in the tree that matches the given id
// eslint-disable-next-line max-len
const useTreeNavigatorSelectedNode = (tree: Tree, selectedIdPath: string[]): Tree | null => useMemo<Tree | null>(() => {
  // Function to traverse the tree and find the selected node path
  const findSelectedNode = (
    remainingTree: Tree,
    remainingSelectedIdPath: string[],
  ): Tree | null => {
    if (remainingTree.id === remainingSelectedIdPath[0]) {
      if (remainingSelectedIdPath.length === 1) {
        return remainingTree;
      }

      const [, ...childrenRemainingSelectedIdPath] = remainingSelectedIdPath;

      // eslint-disable-next-line
      const foundChild = remainingTree.children.find((child) => {
        return child.id === childrenRemainingSelectedIdPath[0];
      });

      if (foundChild) {
        return findSelectedNode(foundChild, childrenRemainingSelectedIdPath);
      }
    }

    return null;
  };

  return findSelectedNode(tree, selectedIdPath);
}, [tree, selectedIdPath]);

export default useTreeNavigatorSelectedNode;
