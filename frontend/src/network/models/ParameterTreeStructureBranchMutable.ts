import { ParameterTreeStructureBranch } from './ParameterTreeStructureBranch';

export type ParameterTreeStructureBranchMutable = ParameterTreeStructureBranch & {
  default_key: string;
  default_name: string;
  allow_multiple: boolean;
};
