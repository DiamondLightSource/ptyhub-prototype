import React from 'react';
import TextInputRevertable from '../TextInputRevertable/TextInputRevertable';
import { Tree } from '../../types/tree';
import DoubleClickViewToggle from '../DoubleClickViewToggle/DoubleClickViewToggle';
import EditIcon from '../../assets/img/icons/edit_icon.svg';

type Props = {
  subtree: Tree,
  idPath: string[],
  isExpandable: boolean,
  isNameEditable?: boolean,
  onNameEdit?: (id: string, newName: string) => void,
  onSelect?: (selectedIdPath: string[]) => void
  onTypeChange?: (id: string, newType: string) => void,
  isSelected: boolean
};

function TreeNavigatorBranchTextButtons({
  isNameEditable,
  idPath,
  isExpandable,
  onNameEdit,
  subtree,
  onSelect,
  isSelected,
  onTypeChange,
}: Props) {
  const [isNameBeingEdited, setIsNameBeingEdited] = React.useState(false);
  const [isTypeBeingEdited, setIsTypeBeingEdited] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const lastSelectedTimestamp = React.useRef<number>(0);

  const handleSelectSingleClick = () => {
    if (subtree.preventClick) return;
    if (onSelect) {
      onSelect(idPath);
    }
  };

  const handleSelectDoubleClick = () => {
    setIsNameBeingEdited(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    });
  };

  const handleSelect = () => {
    const currentTimestamp = new Date().getTime();
    if (isNameEditable && currentTimestamp - lastSelectedTimestamp.current < 300) {
      handleSelectDoubleClick();
    } else {
      handleSelectSingleClick();
    }

    lastSelectedTimestamp.current = currentTimestamp;
  };

  return (
    <>
      <DoubleClickViewToggle
        defaultView={(
          <button
            type="button"
            className={`tree-navigator-branch__name-button
           ${isExpandable ? 'tree-navigator-branch__name-button--expandable' : ''}
           ${isSelected ? 'tree-navigator-branch__name-button--selected' : ''}`}
            onClick={handleSelect}
          >
            {subtree.name}
          </button>
      )}
        doubleClickView={(
          <TextInputRevertable
            onValueChange={(newValue) => {
              if (onNameEdit) {
                onNameEdit(subtree.id, newValue);
                setIsNameBeingEdited(false);
              }
            }}
            defaultValue={subtree.name}
            onFocusOut={() => setIsNameBeingEdited(false)}
            ref={nameInputRef}
          />
      )}
        inDoubleClickMode={isNameBeingEdited}
        allowDoubleClick={isNameEditable}
        onDoubleClick={handleSelectDoubleClick}
        onClick={handleSelectSingleClick}
      />

      {
        !isNameBeingEdited && isNameEditable && (
          <button type="button" onClick={handleSelectDoubleClick}>
            <img src={EditIcon} alt="Edit" width={20} height={20} />
          </button>
        )
      }

      {
        subtree.mutableType && subtree.parentMutableBranchStructure && (
          <>
            <DoubleClickViewToggle
              defaultView={(
                <button
                  type="button"
                  className={
                    `tree-navigator-branch__name-button
                    ${isExpandable ? 'tree-navigator-branch__name-button--expandable' : ''}
                    ${isSelected ? 'tree-navigator-branch__name-button--selected' : ''}`
                  }
                  onClick={handleSelect}
                >
                  {`(${subtree.mutableType})`}
                </button>
              )}
              doubleClickView={subtree.parentMutableBranchStructure && (
                <>
                  <select
                    value={subtree.mutableType}
                    onChange={(e) => {
                      setIsTypeBeingEdited(false);
                      if (onTypeChange) onTypeChange(subtree.id, e.target.value);
                    }}
                  >
                    {Object.keys(subtree.parentMutableBranchStructure.value).map((branch) => (
                      <option value={branch} key={branch}>{branch}</option>
                    ))}
                  </select>

                  <button type="button" onClick={() => setIsTypeBeingEdited(false)}>
                    X
                  </button>
                </>
              )}
              inDoubleClickMode={isTypeBeingEdited}
              onDoubleClick={() => setIsTypeBeingEdited(true)}
            />

            {
              !isTypeBeingEdited && (
                <button type="button" onClick={() => setIsTypeBeingEdited(true)}>
                  <img src={EditIcon} alt="Edit" width={20} height={20} />
                </button>
              )
            }
          </>
        )
      }
    </>
  );
}

TreeNavigatorBranchTextButtons.defaultProps = {
  isNameEditable: false,
  onNameEdit: () => {},
  onSelect: () => {},
  onTypeChange: () => {},
};

export default TreeNavigatorBranchTextButtons;
