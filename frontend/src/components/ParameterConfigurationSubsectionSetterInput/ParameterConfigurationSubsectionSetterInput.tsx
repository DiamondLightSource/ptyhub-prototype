import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ParameterTreeDataLeaf from '../../classes/parameterTreeData/parameterTreeDataLeaf';
import { ParameterTreeStructureLeaf } from '../../network';

type Props = {
  parameter: ParameterTreeDataLeaf,
  onParameterValueChanged: (value: any) => void,
};

enum ParameterType {
  STRING = 'string',
  LIST = 'list',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

const PARAMETER_TYPE_PRIORITY: ParameterType[] = [
  ParameterType.STRING,
  ParameterType.NUMBER,
  ParameterType.BOOLEAN,
  ParameterType.LIST,
  ParameterType.JSON,
];

interface ParameterStringEnumMap {
  [key: string]: ParameterType;
}

const PARAMETER_STRING_ENUM_MAP: ParameterStringEnumMap = {
  str: ParameterType.STRING,
  // list: ParameterType.LIST,
  int: ParameterType.NUMBER,
  float: ParameterType.NUMBER,
  bool: ParameterType.BOOLEAN,
};

function ParameterConfigurationSubsectionSetterInput({
  parameter,
  onParameterValueChanged,
}: Props) {
  const [temporaryValue, setTemporaryValue] = useState<any>();
  const [parameterType, setParameterType] = useState<ParameterType>();

  const parameterStructure = parameter.structure as ParameterTreeStructureLeaf;

  useEffect(() => {
    const enumTypes = parameterStructure.parameterType.map(
      (type) => PARAMETER_STRING_ENUM_MAP[type],
    );

    const priority = PARAMETER_TYPE_PRIORITY.filter((type) => enumTypes.includes(type));

    const newParameterType = priority.length === 0 ? ParameterType.JSON : priority[0];

    setParameterType(newParameterType);

    let newValue: any;
    switch (newParameterType) {
      case ParameterType.STRING:
        newValue = String(parameter.value);
        break;
      case ParameterType.NUMBER:
        newValue = Number(parameter.value);
        break;
      case ParameterType.BOOLEAN:
        newValue = Boolean(parameter.value);
        break;
      case ParameterType.JSON:
        newValue = JSON.stringify(parameter.value);
        break;
      default:
        newValue = parameter.value;
    }

    setTemporaryValue(newValue);
  }, [parameter]);

  const handleChange = (value: any, isPermanentChange: boolean) => {
    if (!isPermanentChange) {
      setTemporaryValue(value);
      return;
    }

    let newValue: any;
    switch (parameterType) {
      case ParameterType.STRING:
        newValue = String(value);
        break;
      case ParameterType.NUMBER:
        newValue = Number(value);
        break;
      case ParameterType.BOOLEAN:
        newValue = Boolean(value);
        break;
      case ParameterType.JSON:
        try {
          newValue = JSON.parse(String(value));
        } catch (e) {
          toast.error('Unable to parse JSON');
          setTemporaryValue(JSON.stringify(parameter.value));
          return;
        }

        break;
      default:
        newValue = value;
    }

    onParameterValueChanged(newValue);
  };

  return (
    <div>
      {/* Is undefined for first tick once component is initialised */}
      {(temporaryValue !== undefined) && (
        <>
          {(parameterType === ParameterType.STRING || parameterType === ParameterType.NUMBER)
            && parameterStructure.choices && (
              <select
                value={String(temporaryValue)}
                onChange={(event) => handleChange(event.target.value, true)}
              >
                {parameterStructure.choices.map((choice) => (
                  <option value={String(choice)} key={String(choice)}>{choice}</option>
                ))}
              </select>
          )}

          {parameterType === ParameterType.STRING && !parameterStructure.choices && (
            <textarea
              value={String(temporaryValue)}
              onChange={(event) => handleChange(event.target.value, false)}
              onBlur={(event) => {
                handleChange(event.target.value, true);
              }}
            />
          )}

          {parameterType === ParameterType.NUMBER && !parameterStructure.choices && (
            <input
              type="number"
              value={Number(temporaryValue)}
              onChange={(event) => {
                // Don't do a permanent change if we have the input box focused
                // If it is not focused the side arrows have been used to change the number,
                // so change permanently
                handleChange(event.target.value, document.activeElement !== event.target);
              }}
              onBlur={(event) => handleChange(event.target.value, true)}
            />
          )}

          {parameterType === ParameterType.BOOLEAN && (
            <input
              type="checkbox"
              checked={Boolean(temporaryValue)}
              onChange={(event) => handleChange(event.target.checked, true)}
            />
          )}

          {parameterType === ParameterType.JSON && (
            <textarea
              value={temporaryValue}
              onChange={(event) => handleChange(event.target.value, false)}
              onBlur={(event) => {
                handleChange(event.target.value, true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ParameterConfigurationSubsectionSetterInput;
