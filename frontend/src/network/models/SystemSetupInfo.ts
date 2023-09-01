/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type SystemSetupInfo = {
  deployment_mode: boolean;
  is_authenticated: boolean;
  requires_authentication: boolean;
  user: (User | null);
};

