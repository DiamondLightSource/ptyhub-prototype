/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtraOption } from './ExtraOption';
import type { ParameterTreeStructureBranch } from './ParameterTreeStructureBranch';
import type { ParameterTreeStructureBranchMutable } from './ParameterTreeStructureBranchMutable';
import type { ParameterTreeType } from './ParameterTreeType';

export type ParameterTreeBeamline = {
  id: string;
  name: string;
  parameter_tree_type: ParameterTreeType;
  definitions: Record<string, (ParameterTreeStructureBranchMutable | ParameterTreeStructureBranch)>;
  root: (ParameterTreeStructureBranch | ParameterTreeStructureBranchMutable);
  default_output_folder: string;
  extra_options: Array<ExtraOption>;
  save_extra_options_to_config: boolean;
};

