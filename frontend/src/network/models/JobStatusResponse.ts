/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogsResponse } from './LogsResponse';
import type { ReconstructionViewerResponse } from './ReconstructionViewerResponse';

export type JobStatusResponse = {
  reconstruction?: ReconstructionViewerResponse;
  logs: LogsResponse;
};

