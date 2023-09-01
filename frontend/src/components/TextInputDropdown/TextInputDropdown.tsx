import React from 'react';
import './TextInputDropdown.css';
import { v4 as uuid4 } from 'uuid';
import TextInputDropdownRow from '../TextInputDropdownRow/TextInputDropdownRow';

type Props = {
  values: [string, string][]
  placeholderText: string
  onUpdate: (newValues: [string, string][]) => void
};

function TextInputDropdown({
  values, placeholderText, onUpdate,
}: Props) {
  const [listExpanded, setListExpanded] = React.useState<boolean>(false);
  const unexpandTimeout = React.useRef<number | null>(null);
  const adderInputBoxRef = React.useRef<HTMLInputElement>(null);

  const handleInputBoxFocus = () => {
    // It takes 1 tick for the input box to be refocused when a new element in the dropdown
    // is clicked, so we need to wait for the next tick before unexpanding the dropdown.
    // https://reactjs.org/docs/accessibility.html#mouse-and-pointer-events
    if (unexpandTimeout.current !== null) {
      // Stop the dropdown from being closed!
      clearTimeout(unexpandTimeout.current);
      unexpandTimeout.current = null;
    }

    setListExpanded(true);
  };

  const handleInputBoxFocusOut = () => {
    unexpandTimeout.current = window.setTimeout(() => {
      // In 1 tick close the dropdown, see above for why we need to wait
      setListExpanded(false);
    });
  };

  const handleRowDelete = (id: string) => {
    adderInputBoxRef.current?.focus();
    const newValues = values.filter(
      ([valueId]) => valueId !== id,
    );

    onUpdate(newValues);
  };

  const handleValueAdd = (newValue: string) => {
    const newValues: [string, string][] = [...values, [uuid4(), newValue]];
    onUpdate(newValues);
  };

  const handleValueChange = (id: string, newValue: string) => {
    const newScanNumbers: [string, string][] = values.map(
      ([valueId, value]) => {
        if (valueId === id) {
          return [valueId, newValue];
        }

        return [valueId, value];
      },
    );

    onUpdate(newScanNumbers);
  };

  return (
    <div>
      <div
        className="text-input-dropdown"
        onFocus={handleInputBoxFocus}
        onBlur={handleInputBoxFocusOut}
      >
        <TextInputDropdownRow
          value=""
          placeholderText={placeholderText}
          onSubmitted={handleValueAdd}
          ref={adderInputBoxRef}
          isAdderRow
        />

        {
          values.map(([id, value]) => (
            <TextInputDropdownRow
              key={id}
              value={value}
              hidden={!listExpanded}
              onSubmitted={(newValue) => handleValueChange(id, newValue)}
              onDeleted={() => handleRowDelete(id)}
            />
          ))
        }
      </div>

      {/* Placeholder element to make element take up correct amount of space
       (otherwise it wouldn't because it has position absolute) */}
      <div className="text-input-dropdown text-input-dropdown--placeholder">
        <TextInputDropdownRow
          value="1"
          onSubmitted={() => {
          }}
        />
      </div>
    </div>
  );
}

export default TextInputDropdown;
