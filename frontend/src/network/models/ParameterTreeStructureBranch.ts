import { ParameterTreeStructureBaseModel } from './ParameterTreeStructureBaseModel';
import { ParameterTreeStructureLeaf } from './ParameterTreeStructureLeaf';
import { Reference } from './Reference';
import { ParameterTreeStructureBranchMutable } from './ParameterTreeStructureBranchMutable';

export type ParameterTreeStructureBranch = ParameterTreeStructureBaseModel & {
  // eslint-disable-next-line max-len
  value: Record<string, ParameterTreeStructureBranch | ParameterTreeStructureBranchMutable | ParameterTreeStructureLeaf | Reference>;
};
