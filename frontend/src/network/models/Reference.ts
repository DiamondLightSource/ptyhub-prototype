import { ParameterTreeStructureBaseModel } from './ParameterTreeStructureBaseModel';

export type Reference = ParameterTreeStructureBaseModel & {
  $ref: string;
};
