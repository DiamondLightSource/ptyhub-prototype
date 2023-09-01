import ParameterTreeDataBase from './parameterTreeDataBase';
import {
  ParameterTreeStructureBaseModel,
} from '../../network/models/ParameterTreeStructureBaseModel';

export default class ParameterTreeDataLeaf extends ParameterTreeDataBase {
  value: string | number | boolean | string[] | number[] | boolean[] | null;

  constructor(
    id: string,
    idPath: string[],
    name: string,
    structure: ParameterTreeStructureBaseModel,
    value: string | number | boolean | string[] | number[] | boolean[] | null,
  ) {
    super(id, idPath, name, structure);
    this.value = value;
  }

  serializeObject(): any {
    return this.value;
  }
}
