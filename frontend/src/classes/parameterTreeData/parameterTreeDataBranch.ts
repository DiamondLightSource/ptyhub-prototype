import ParameterTreeDataBase from './parameterTreeDataBase';
import {
  ParameterTreeStructureBaseModel,
} from '../../network/models/ParameterTreeStructureBaseModel';

export default class ParameterTreeDataBranch extends ParameterTreeDataBase {
  children: ParameterTreeDataBase[];

  constructor(
    id: string,
    idPath: string[],
    name: string,
    structure: ParameterTreeStructureBaseModel,
    children: ParameterTreeDataBase[],
    mutableStructureType?: string,
  ) {
    super(id, idPath, name, structure);
    this.children = children;
    this.mutableStructureType = mutableStructureType;
  }

  serializeObject(): any {
    const yamlObject: any = {};

    this.children.forEach((child) => {
      yamlObject[child.name] = child.serializeObject();
    });

    return yamlObject;
  }
}
