import React from 'react';
import { Tree } from '../../types/tree';
import useTreeNavigatorSelectedNodePath from '../../hooks/useTreeNavigatorSelectedNodePath';
import './TreeNavigatorLinkPath.css';

type Props = {
  tree: Tree,
  selectedIdPath: string[],
  onParamSelect: (selectedIdPath: string[]) => void
};

const SELECTED_PATH_MAX_LENGTH = 5;

function TreeNavigatorLinkPath({ tree, selectedIdPath, onParamSelect }: Props) {
  const selectedPath = useTreeNavigatorSelectedNodePath(tree, selectedIdPath);

  return (
    <div className="tree-navigator-link-path">
      {
        selectedPath.length > SELECTED_PATH_MAX_LENGTH && (
          <div className="tree-navigator-link-path__element">
            <span>
              ...
            </span>

            <span className="tree-navigator-link-path__element__arrow">→</span>
          </div>
        )
      }
      {
        // We want to keep the original indexes after the slice, so we map the indexes
        // before we slice
        selectedPath
          .map((node, index): [Tree, number] => [node, index])
          // Only keep the last 5 elements (or less if there are less than 5)
          .slice(
            selectedPath.length > SELECTED_PATH_MAX_LENGTH
              ? selectedPath.length - SELECTED_PATH_MAX_LENGTH : 0,
            selectedPath.length,
          )
          .map(([node, index]) => (
            <div
              key={selectedIdPath.slice(0, index + 1).join('-')}
              className="tree-navigator-link-path__element"
            >
              <button
                type="button"
                onClick={() => onParamSelect(selectedIdPath.slice(0, index + 1))}
                className="tree-navigator-link-path__element__button"
              >
                {node.name}
              </button>

              { index !== selectedPath.length - 1 && (
              <span className="tree-navigator-link-path__element__arrow">→</span>
              )}
            </div>
          ))
      }
    </div>
  );
}

export default TreeNavigatorLinkPath;
