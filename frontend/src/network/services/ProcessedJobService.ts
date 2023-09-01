/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProcessedJobService {

  /**
   * Processed Job Config
   * @param processedJobId
   * @param autoError
   * @returns string Successful Response
   * @throws ApiError
   */
  public static getProcessedJobConfig(
    processedJobId: number,
    autoError?: any,
  ): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/processed-job/get-config',
      query: {
        'processed_job_id': processedJobId,
        'auto_error': autoError,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
