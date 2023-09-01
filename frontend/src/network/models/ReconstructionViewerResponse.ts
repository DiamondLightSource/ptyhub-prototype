/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GraphData } from './GraphData';
import type { ScanData } from './ScanData';

export type ReconstructionViewerResponse = {
  probe: ScanData;
  object: ScanData;
  graph: GraphData;
  is_finished: boolean;
};
