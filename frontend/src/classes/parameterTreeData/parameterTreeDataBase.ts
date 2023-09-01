import {
  ParameterTreeStructureBaseModel,
} from '../../network/models/ParameterTreeStructureBaseModel';

export default abstract class ParameterTreeDataBase {
  id: string;

  idPath: string[];

  name: string;

  structure: ParameterTreeStructureBaseModel;

  mutableStructureType?: string;

  protected constructor(
    id: string,
    idPath: string[],
    name: string,
    structure: ParameterTreeStructureBaseModel,
    mutableStructureType?: string,
  ) {
    this.id = id;
    this.idPath = idPath;
    this.name = name;
    this.structure = structure;
    this.mutableStructureType = mutableStructureType;
  }

  abstract serializeObject(): any;
}
