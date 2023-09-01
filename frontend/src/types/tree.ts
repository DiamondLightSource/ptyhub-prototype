import { ParameterTreeStructureBranchMutable } from '../network';

export type Tree = {
  id: string,
  name: string,
  areChildrenMutable: boolean,
  allowAddChildren: boolean,
  preventClick?: boolean,
  children: Tree[],
  parentMutableBranchStructure?: ParameterTreeStructureBranchMutable,
  mutableType?: string,
};
