/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterType } from './ClusterType';
import type { ParameterTreeType } from './ParameterTreeType';

export type ClusterFormSubmissionDeployment = {
  config_file_data: string;
  scan_id: string;
  cluster: ClusterType;
  use_gpu: boolean;
  parameter_tree_type: ParameterTreeType;
  extra_option_values: any;
  processed_job_id: number;
  slurm_jwt: string;
};

