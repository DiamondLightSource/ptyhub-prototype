/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterFormSubmissionSubmittedJob } from './ClusterFormSubmissionSubmittedJob';

export type ClusterFormSubmissionResponse = {
  success: boolean;
  submitted_jobs: Array<ClusterFormSubmissionSubmittedJob>;
};
