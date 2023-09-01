/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterType } from './ClusterType';
import type { ParameterTreeType } from './ParameterTreeType';

export type ClusterFormSubmissionLocal = {
  config_file_data: string;
  scan_id: string;
  cluster: ClusterType;
  use_gpu: boolean;
  parameter_tree_type: ParameterTreeType;
  extra_option_values: any;
  output_folder_path: string;
};

