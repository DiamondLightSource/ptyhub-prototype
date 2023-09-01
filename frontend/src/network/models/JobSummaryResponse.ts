/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { JobStatus } from './JobStatus';

export type JobSummaryResponse = {
  job_id: string;
  scan_id: string;
  progress_percent: number;
  status: JobStatus;
};

