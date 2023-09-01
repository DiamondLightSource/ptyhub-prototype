/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemSetupInfo } from '../models/SystemSetupInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemSetupService {

  /**
   * Get System Info
   * @returns SystemSetupInfo Successful Response
   * @throws ApiError
   */
  public static getSystemInfo(): CancelablePromise<SystemSetupInfo> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/system-setup/info',
    });
  }

}
