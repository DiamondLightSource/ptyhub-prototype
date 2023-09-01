import React, { useEffect, useMemo } from 'react';
import { Tree } from '../../types/tree';
import './TreeNavigatorBranch.css';
import DropdownArrowImage from '../../assets/img/icons/dropdown_arrow_blue.svg';
import TreeNavigatorBranchButton from '../TreeNavigatorBranchTextButtons/TreeNavigatorBranchTextButtons';

type Props = {
  subtree: Tree
  selectedIdPath: string[]
  parentIdPath: string[]
  parentExpanded?: boolean
  expandedByDefault?: boolean
  alwaysShowArrow?: boolean
  isNameEditable?: boolean
  style?: React.CSSProperties
  onSelect?: (selectedIdPath: string[]) => void
  onAdd?: (addToId: string) => void
  onNameEdit?: (id: string, newName: string) => void
  onTypeChange?: (id: string, newType: string) => void,
};

function TreeNavigatorBranch(
  {
    subtree,
    selectedIdPath,
    parentIdPath,
    parentExpanded,
    expandedByDefault,
    alwaysShowArrow,
    isNameEditable,
    style,
    onSelect,
    onAdd,
    onNameEdit,
    onTypeChange,
  }: Props,
) {
  const [expanded, setExpanded] = React.useState(expandedByDefault ?? false);

  const idPath: string[] = useMemo(
    () => [...parentIdPath, subtree.id],
    [parentIdPath, subtree.id],
  );

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    // If the selected node is this node or a child of this node, expand this node
    if (selectedIdPath.length >= idPath.length) {
      const isChild = idPath.every((id, i) => id === selectedIdPath[i]);
      if (isChild) {
        setExpanded(true);
      }
    }
  }, [selectedIdPath]);

  // eslint-disable-next-line max-len
  const isExpandable = useMemo<boolean>(() => subtree.children.length > 0 || (alwaysShowArrow ?? false), [subtree, expandedByDefault]);
  // eslint-disable-next-line max-len
  const isSelected = useMemo<boolean>(() => selectedIdPath.length === idPath.length && selectedIdPath.every((id, i) => id === idPath[i]), [selectedIdPath, idPath]);

  return (
    <div className="tree-navigator-branch" style={style}>
      <div className="tree-navigator-branch__header">
        {isExpandable && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="tree-navigator-branch__dropdown-arrow"
          >
            <img
              src={DropdownArrowImage}
              alt="Dropdown arrow"
              className={`tree-navigator-branch__dropdown-arrow__image 
                ${expanded ? 'tree-navigator-branch__dropdown-arrow__image--expanded' : ''}`}
            />
          </button>
        )}

        <TreeNavigatorBranchButton
          idPath={idPath}
          subtree={subtree}
          onNameEdit={onNameEdit}
          isNameEditable={isNameEditable}
          isExpandable={isExpandable}
          isSelected={isSelected}
          onSelect={onSelect}
          onTypeChange={onTypeChange}
        />

        {
          subtree.areChildrenMutable && subtree.allowAddChildren && (
            <button
              type="button"
              onClick={() => {
                if (onAdd) onAdd(subtree.id);
              }}
            >
              +
            </button>
          )
        }
      </div>

      <div className="tree-navigator-branch__children">
        {
          parentExpanded && subtree.children.map((child) => (
            <TreeNavigatorBranch
              parentIdPath={idPath}
              parentExpanded={expanded}
              expandedByDefault={expandedByDefault}
              isNameEditable={subtree.areChildrenMutable && subtree.allowAddChildren}
              alwaysShowArrow={false}
              subtree={child}
              selectedIdPath={selectedIdPath}
              style={{ display: expanded ? undefined : 'none' }}
              onSelect={onSelect}
              key={child.id}
              onAdd={onAdd}
              onNameEdit={onNameEdit}
              onTypeChange={onTypeChange}
            />
          ))
        }
      </div>

    </div>
  );
}

TreeNavigatorBranch.defaultProps = {
  parentExpanded: true,
  expandedByDefault: false,
  alwaysShowArrow: false,
  isNameEditable: false,
  style: {},
  onSelect: () => {},
  onAdd: () => {},
  onNameEdit: () => {},
  onTypeChange: () => {},
};

export default TreeNavigatorBranch;
