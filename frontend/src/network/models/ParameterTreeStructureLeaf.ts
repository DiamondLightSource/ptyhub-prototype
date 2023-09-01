import { ParameterTreeStructureBaseModel } from './ParameterTreeStructureBaseModel';

export type ParameterTreeStructureLeaf = ParameterTreeStructureBaseModel & {
  name: string;
  parameterType: string[];
  user_level: number;
  description_short: string;
  description_long: string;
  default: any;
  choices: (null | number | boolean | string)[] | null;
};
